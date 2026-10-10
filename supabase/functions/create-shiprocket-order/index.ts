// Supabase Edge Function: create-shiprocket-order
// Deploy: supabase functions deploy create-shiprocket-order

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external'
const SHIPROCKET_EMAIL = Deno.env.get('SHIPROCKET_EMAIL')!
const SHIPROCKET_PASSWORD = Deno.env.get('SHIPROCKET_PASSWORD')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get Shiprocket Auth Token
async function getShiprocketToken() {
  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Shiprocket auth failed:', errorText)
    throw new Error(`Failed to authenticate with Shiprocket: ${errorText}`)
  }

  const data = await response.json()
  return data.token
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const orderData = await req.json()

    // Get auth token
    const token = await getShiprocketToken()

    // Create Shiprocket order
    const shipmentResponse = await fetch(`${SHIPROCKET_API_URL}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        order_id: orderData.order_id,
        order_date: orderData.order_date || new Date().toISOString().split('T')[0],
        pickup_location: orderData.pickup_location || 'work',
        channel_id: '',
        comment: orderData.comment || '',
        billing_customer_name: orderData.customer_name,
        billing_last_name: orderData.customer_last_name || '',
        billing_address: orderData.billing_address,
        billing_address_2: orderData.billing_address_2 || '',
        billing_city: orderData.billing_city,
        billing_pincode: orderData.billing_pincode,
        billing_state: orderData.billing_state,
        billing_country: orderData.billing_country || 'India',
        billing_email: orderData.customer_email,
        billing_phone: orderData.customer_phone,
        shipping_is_billing: orderData.shipping_is_billing !== false,
        shipping_customer_name: orderData.shipping_customer_name || orderData.customer_name,
        shipping_last_name: orderData.shipping_last_name || '',
        shipping_address: orderData.shipping_address || orderData.billing_address,
        shipping_address_2: orderData.shipping_address_2 || '',
        shipping_city: orderData.shipping_city || orderData.billing_city,
        shipping_pincode: orderData.shipping_pincode || orderData.billing_pincode,
        shipping_country: orderData.shipping_country || 'India',
        shipping_state: orderData.shipping_state || orderData.billing_state,
        shipping_email: orderData.shipping_email || orderData.customer_email,
        shipping_phone: orderData.shipping_phone || orderData.customer_phone,
        order_items: orderData.order_items,
        payment_method: orderData.payment_method || 'Prepaid',
        shipping_charges: orderData.shipping_charges || 0,
        giftwrap_charges: orderData.giftwrap_charges || 0,
        transaction_charges: orderData.transaction_charges || 0,
        total_discount: orderData.total_discount || 0,
        sub_total: orderData.sub_total,
        length: orderData.length || 10,
        breadth: orderData.breadth || 10,
        height: orderData.height || 10,
        weight: orderData.weight || 0.5
      })
    })

    if (!shipmentResponse.ok) {
      const error = await shipmentResponse.text()
      console.error('Shiprocket order creation failed:', error)
      console.error('Status:', shipmentResponse.status)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create shipment',
          details: error,
          status: shipmentResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shipment = await shipmentResponse.json()

    return new Response(
      JSON.stringify({ success: true, shipment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
