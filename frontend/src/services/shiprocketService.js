import { supabase } from '../lib/supabase'

/**
 * Create Shiprocket order via Edge Function
 */
export async function createShiprocketOrder(orderData) {
  try {
    const { data, error } = await supabase.functions.invoke('create-shiprocket-order', {
      body: orderData
    })

    if (error) {
      console.error('Supabase function error:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('No response data from Shiprocket')
    }
    
    if (!data.success) {
      console.error('Shiprocket API error:', data)
      throw new Error(data.error || data.details || 'Failed to create Shiprocket order')
    }

    return data.shipment
  } catch (error) {
    console.error('Error creating Shiprocket order:', error)
    console.error('Error details:', error.message, error.context)
    throw new Error(error.message || 'Failed to create shipment')
  }
}

/**
 * Track Shiprocket shipment
 */
export async function trackShipment(shipmentId) {
  try {
    const { data, error } = await supabase.functions.invoke('track-shiprocket-shipment', {
      body: { shipment_id: shipmentId }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error || 'Failed to track shipment')

    return data.tracking
  } catch (error) {
    console.error('Error tracking shipment:', error)
    throw new Error(error.message || 'Failed to track shipment')
  }
}

/**
 * Get available courier services for an order
 */
export async function getAvailableCouriers(orderDetails) {
  try {
    const { data, error } = await supabase.functions.invoke('get-shiprocket-couriers', {
      body: orderDetails
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error || 'Failed to get couriers')

    return data.couriers
  } catch (error) {
    console.error('Error getting couriers:', error)
    throw new Error(error.message || 'Failed to get available couriers')
  }
}

/**
 * Cancel Shiprocket order
 */
export async function cancelShipment(shipmentId) {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-shiprocket-order', {
      body: { shipment_id: shipmentId }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error || 'Failed to cancel shipment')

    return data
  } catch (error) {
    console.error('Error cancelling shipment:', error)
    throw new Error(error.message || 'Failed to cancel shipment')
  }
}

/**
 * Generate AWB (Airway Bill) for shipment
 */
export async function generateAWB(shipmentId, courierId) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-shiprocket-awb', {
      body: {
        shipment_id: shipmentId,
        courier_id: courierId
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error || 'Failed to generate AWB')

    return data.awb
  } catch (error) {
    console.error('Error generating AWB:', error)
    throw new Error(error.message || 'Failed to generate AWB')
  }
}
