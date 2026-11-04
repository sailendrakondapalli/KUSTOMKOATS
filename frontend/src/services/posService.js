import { supabase } from '../lib/supabase'
import { 
  savePendingSale, 
  getPendingSales, 
  markSaleAsSynced,
  updateLocalStock
} from './offlineDB'

// Sync lock to prevent concurrent sync operations
let isSyncing = false

// Create POS sale (online or offline)
export async function createPOSSale({
  items,
  total,
  paymentMethod,
  cashReceived,
  changeGiven,
  customerName,
  customerPhone,
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature
}) {
  const saleData = {
    items,
    total,
    payment_method: paymentMethod,
    cash_received: cashReceived,
    change_given: changeGiven,
    customer_name: customerName,
    customer_phone: customerPhone,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
    sale_date: new Date().toISOString()
  }

  // Try online first
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'paid',
        order_status: 'completed',
        guest_name: customerName || 'Walk-in Customer',
        guest_phone: customerPhone || null,
        guest_email: null,
        address: null,
        order_type: 'pos_sale',
        razorpay_payment_id: razorpayPaymentId || null,
        razorpay_order_id: razorpayOrderId || null
      })
      .select()
      .single()

    if (error) throw error

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: data.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }))

    await supabase.from('order_items').insert(orderItems)

    // Update stock in database
    for (const item of items) {
      await updateProductStock(item.product_id, item.quantity)
    }

    return { success: true, saleId: data.id, online: true }

  } catch (error) {
    console.log('Offline mode: Saving sale locally', error)
    
    // Save offline
    const localId = await savePendingSale(saleData)
    
    // Update local stock
    for (const item of items) {
      await updateLocalStock(item.product_id, item.quantity)
    }

    return { success: true, saleId: localId, online: false }
  }
}

// Update product stock
async function updateProductStock(productId, quantitySold) {
  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (product) {
    const newStock = Math.max(0, product.stock - quantitySold)
    await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
  }
}

// Sync pending sales to server
export async function syncPendingSales() {
  // Prevent concurrent syncs
  if (isSyncing) {
    console.log('Sync already in progress, skipping...')
    return { synced: 0, failed: 0, skipped: true }
  }

  isSyncing = true

  try {
    const pendingSales = await getPendingSales()
    
    if (pendingSales.length === 0) {
      return { synced: 0, failed: 0 }
    }

    let synced = 0
    let failed = 0

    for (const sale of pendingSales) {
      try {
        // Create order in database
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            total_amount: sale.total,
            payment_method: sale.payment_method,
            payment_status: 'paid',
            order_status: 'completed',
            guest_name: sale.customer_name || 'Walk-in Customer',
            guest_phone: sale.customer_phone || null,
            guest_email: null,
            address: null,
            order_type: 'pos_sale',
            created_at: new Date(sale.timestamp).toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Insert order items
        const orderItems = sale.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))

        await supabase.from('order_items').insert(orderItems)

        // Sync stock
        for (const item of sale.items) {
          await updateProductStock(item.product_id, item.quantity)
        }

        // Mark as synced
        await markSaleAsSynced(sale.id)
        synced++

      } catch (error) {
        console.error('Failed to sync sale:', sale.id, error)
        failed++
      }
    }

    return { synced, failed }

  } catch (error) {
    console.error('Sync error:', error)
    return { synced: 0, failed: 0, error }
  } finally {
    isSyncing = false
  }
}

// Check online status
export async function checkOnlineStatus() {
  try {
    const { error } = await supabase.from('products').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
