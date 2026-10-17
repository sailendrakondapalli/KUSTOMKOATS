// Supabase Edge Function: razorpay-webhook
// This receives Razorpay payment notifications automatically
// Deploy: supabase functions deploy razorpay-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // Get webhook signature from headers
    const signature = req.headers.get('x-razorpay-signature')
    
    if (!signature) {
      console.error('Missing webhook signature')
      return new Response(JSON.stringify({ error: 'Missing signature' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get raw body
    const rawBody = await req.text()
    
    // Verify webhook signature
    const expectedSignature = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody)
    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity || {}

    console.log(`Webhook received: ${event}`)

    // Handle payment.captured event (successful payment)
    if (event === 'payment.captured') {
      const razorpayOrderId = paymentEntity.order_id
      const razorpayPaymentId = paymentEntity.id
      const amount = paymentEntity.amount
      const status = paymentEntity.status

      console.log(`Payment captured: ${razorpayPaymentId} for order ${razorpayOrderId}`)

      // Update order in database
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

      const { data: order, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'confirmed',
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpayOrderId)
        .select()
        .single()

      if (error) {
        console.error('Error updating order:', error)
        
        // If order not found by razorpay_order_id, it might be an old format
        // Try to find pending orders and update
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('payment_status', 'pending')
          .eq('razorpay_order_id', razorpayOrderId)
        
        if (pendingOrders && pendingOrders.length > 0) {
          console.log(`Found ${pendingOrders.length} pending orders matching razorpay_order_id`)
        }
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Order not found',
          razorpay_order_id: razorpayOrderId
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      console.log(`Order ${order.id} updated successfully`)

      return new Response(JSON.stringify({ 
        success: true, 
        order_id: order.id,
        message: 'Payment confirmed'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle payment.failed event
    if (event === 'payment.failed') {
      const razorpayOrderId = paymentEntity.order_id
      const razorpayPaymentId = paymentEntity.id

      console.log(`Payment failed: ${razorpayPaymentId} for order ${razorpayOrderId}`)

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpayOrderId)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Payment failure recorded'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // For other events, just acknowledge
    console.log(`Unhandled event: ${event}`)
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Event received'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
