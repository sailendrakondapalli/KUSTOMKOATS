/**
 * Government E-Way Bill API Service
 * Uses Supabase Database Function with async polling
 */

import { supabase } from '../lib/supabase'

class EWayBillService {
  constructor() {
    this.authToken = null
    this.tokenExpiry = null
  }

  /**
   * Call Database Function proxy (async with polling)
   */
  async callProxy(action, data) {
    // Step 1: Initiate the request
    const { data: requestId, error: initiateError } = await supabase.rpc('initiate_eway_bill_request', {
      action,
      api_data: data,
    })

    if (initiateError) {
      throw new Error(initiateError.message || 'Failed to initiate request')
    }

    // Step 2: Poll for response (max 25 attempts = 25 seconds)
    let lastError = null
    for (let i = 0; i < 25; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const { data: response, error: responseError } = await supabase.rpc('get_eway_bill_response', {
        req_id: requestId
      })

      if (responseError) {
        lastError = responseError.message || 'Failed to get response'
        console.warn(`Attempt ${i + 1}: ${lastError}`)
        continue // Continue polling even if there's an error
      }

      if (response.status === 'completed') {
        return response.data
      }

      if (response.status === 'failed') {
        const errorMsg = response.error || 'Request failed'
        // If pg_net is not working, provide helpful error
        if (errorMsg.includes('pg_net')) {
          throw new Error(
            'E-Way Bill proxy is not working. pg_net extension may not be enabled or working on your Supabase instance. ' +
            'Please enable pg_net in Supabase Dashboard > Database > Extensions, or use Edge Functions instead.'
          )
        }
        throw new Error(errorMsg)
      }

      // Status is 'pending', continue polling
      if (i % 5 === 0 && i > 0) {
        console.log(`Still waiting for E-Way Bill API response... (${i} seconds)`)
      }
    }

    // Provide more helpful timeout error
    throw new Error(
      `Request timed out after 25 seconds. ${lastError ? 'Last error: ' + lastError + '. ' : ''}` +
      'This usually means pg_net is not enabled or not working properly on Supabase. ' +
      'Check Supabase Dashboard > Database > Extensions to enable pg_net.'
    )
  }

  /**
   * Authenticate with E-Way Bill API
   * @param {string} username - E-Way Bill username
   * @param {string} password - E-Way Bill password
   * @returns {Promise<string>} Auth token
   */
  async authenticate(username, password) {
    try {
      const result = await this.callProxy('authenticate', { username, password })
      
      this.authToken = result.authtoken
      this.tokenExpiry = Date.now() + (6 * 60 * 60 * 1000) // Token valid for 6 hours
      
      return this.authToken
    } catch (error) {
      console.error('E-Way Bill authentication error:', error)
      throw error
    }
  }

  /**
   * Check if token is valid
   */
  isTokenValid() {
    return this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry
  }

  /**
   * Generate E-Way Bill
   * @param {Object} ewayBillData - E-Way Bill generation data
   * @returns {Promise<Object>} Generated E-Way Bill details
   */
  async generateEWayBill(ewayBillData) {
    if (!this.isTokenValid()) {
      throw new Error('Auth token expired or invalid. Please authenticate first.')
    }

    try {
      const result = await this.callProxy('generate', {
        authToken: this.authToken,
        ewayBillData,
      })
      
      return result
    } catch (error) {
      console.error('E-Way Bill generation error:', error)
      throw error
    }
  }

  /**
   * Get E-Way Bill details
   * @param {string} ewbNo - E-Way Bill number
   * @returns {Promise<Object>} E-Way Bill details
   */
  async getEWayBill(ewbNo) {
    if (!this.isTokenValid()) {
      throw new Error('Auth token expired or invalid. Please authenticate first.')
    }

    try {
      const result = await this.callProxy('get', {
        authToken: this.authToken,
        ewbNo,
      })
      
      return result
    } catch (error) {
      console.error('E-Way Bill fetch error:', error)
      throw error
    }
  }

  /**
   * Cancel E-Way Bill
   * @param {string} ewbNo - E-Way Bill number
   * @param {number} cancelRsnCode - Cancellation reason code (2-5)
   * @param {string} cancelRmrk - Cancellation remarks
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelEWayBill(ewbNo, cancelRsnCode, cancelRmrk) {
    if (!this.isTokenValid()) {
      throw new Error('Auth token expired or invalid. Please authenticate first.')
    }

    try {
      const result = await this.callProxy('cancel', {
        authToken: this.authToken,
        ewbNo,
        cancelRsnCode,
        cancelRmrk,
      })
      
      return result
    } catch (error) {
      console.error('E-Way Bill cancellation error:', error)
      throw error
    }
  }

  /**
   * Format order data for E-Way Bill generation
   * @param {Object} order - Order object
   * @param {Object} config - E-Way Bill configuration (GSTIN, etc.)
   * @returns {Object} Formatted E-Way Bill data
   */
  formatOrderForEWayBill(order, config) {
    const orderItems = order.order_items || []
    
    // Calculate totals
    const totalValue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cgstRate = config.cgstRate || 9 // Default 9%
    const sgstRate = config.sgstRate || 9 // Default 9%
    const cgstValue = (totalValue * cgstRate) / 100
    const sgstValue = (totalValue * sgstRate) / 100
    const totalInvoiceValue = totalValue + cgstValue + sgstValue

    // Format items
    const itemList = orderItems.map((item, index) => ({
      productName: item.products?.name || 'Product',
      productDesc: item.products?.description || '',
      hsnCode: item.products?.hsn_code || config.defaultHsnCode || '3208', // Default HSN for paints
      quantity: item.quantity,
      qtyUnit: 'PCS', // Units: BOT, BAG, KGS, etc.
      cgstRate,
      sgstRate,
      igstRate: 0,
      cessRate: 0,
      cessAdvol: 0,
      taxableAmount: item.price * item.quantity,
    }))

    return {
      supplyType: 'O', // O=Outward, I=Inward
      subSupplyType: '1', // 1=Supply, 2=Import, 3=Export, etc.
      subSupplyDesc: '',
      docType: 'INV', // INV=Invoice, CHL=Challan, BIL=Bill of Supply
      docNo: order.order_number || order.id,
      docDate: new Date().toISOString().split('T')[0].split('-').reverse().join('/'), // DD/MM/YYYY
      
      // Seller (Your business) details
      fromGstin: config.sellerGstin,
      fromTrdName: config.sellerTradeName,
      fromAddr1: config.sellerAddress1,
      fromAddr2: config.sellerAddress2 || '',
      fromPlace: config.sellerPlace,
      fromPincode: config.sellerPincode,
      fromStateCode: config.sellerStateCode, // State code number (e.g., 27 for Maharashtra)
      actFromStateCode: config.sellerStateCode,
      
      // Buyer (Customer) details
      toGstin: order.shipping_gstin || 'URP', // URP if unregistered
      toTrdName: order.shipping_name || order.customer_name,
      toAddr1: order.shipping_address,
      toAddr2: order.shipping_address_2 || '',
      toPlace: order.shipping_city,
      toPincode: order.shipping_pincode,
      toStateCode: this.getStateCode(order.shipping_state),
      actToStateCode: this.getStateCode(order.shipping_state),
      
      // Transport details
      transactionType: 1, // 1=Regular, 2=Bill To-Ship To, 3=Bill From-Dispatch From, 4=Combination of 2 and 3
      transDistance: config.transportDistance || '0',
      transporterId: config.transporterId || '',
      transporterName: config.transporterName || '',
      transDocNo: order.tracking_number || '',
      transDocDate: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),
      vehicleNo: config.vehicleNo || '',
      vehicleType: 'R', // R=Regular, O=Over Dimensional Cargo
      transMode: config.transMode || '1', // 1=Road, 2=Rail, 3=Air, 4=Ship
      
      // Item details
      itemList,
      
      // Value details
      totalValue,
      cgstValue,
      sgstValue,
      igstValue: 0,
      cessValue: 0,
      cessNonAdvolValue: 0,
      otherValue: 0,
      totInvValue: totalInvoiceValue,
    }
  }

  /**
   * Get state code from state name
   * @param {string} stateName - State name
   * @returns {number} State code
   */
  getStateCode(stateName) {
    const stateCodes = {
      'Jammu and Kashmir': 1,
      'Himachal Pradesh': 2,
      'Punjab': 3,
      'Chandigarh': 4,
      'Uttarakhand': 5,
      'Haryana': 6,
      'Delhi': 7,
      'Rajasthan': 8,
      'Uttar Pradesh': 9,
      'Bihar': 10,
      'Sikkim': 11,
      'Arunachal Pradesh': 12,
      'Nagaland': 13,
      'Manipur': 14,
      'Mizoram': 15,
      'Tripura': 16,
      'Meghalaya': 17,
      'Assam': 18,
      'West Bengal': 19,
      'Jharkhand': 20,
      'Odisha': 21,
      'Chhattisgarh': 22,
      'Madhya Pradesh': 23,
      'Gujarat': 24,
      'Daman and Diu': 25,
      'Dadra and Nagar Haveli': 26,
      'Maharashtra': 27,
      'Andhra Pradesh': 28,
      'Karnataka': 29,
      'Goa': 30,
      'Lakshadweep': 31,
      'Kerala': 32,
      'Tamil Nadu': 33,
      'Puducherry': 34,
      'Andaman and Nicobar Islands': 35,
      'Telangana': 36,
      'Ladakh': 37,
    }

    const normalizedState = stateName.trim()
    return stateCodes[normalizedState] || 27 // Default to Maharashtra
  }
}

export default new EWayBillService()
