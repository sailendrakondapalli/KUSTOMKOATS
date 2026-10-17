// Supabase Edge Function for E-Way Bill API Proxy
// Deploy: supabase functions deploy eway-bill-proxy

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EWAY_API_BASE = 'https://api.ewaybillgst.gov.in'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, data } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let response

    switch (action) {
      case 'authenticate':
        response = await fetch(`${EWAY_API_BASE}/authenticate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: data.username,
            password: data.password,
          }),
        })
        break

      case 'generate':
        response = await fetch(`${EWAY_API_BASE}/ewayapi/v1.03/ewayapi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authtoken': data.authToken,
          },
          body: JSON.stringify(data.ewayBillData),
        })
        break

      case 'get':
        response = await fetch(
          `${EWAY_API_BASE}/ewayapi/v1.03/ewayapi/getewaybill?ewbNo=${data.ewbNo}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'authtoken': data.authToken,
            },
          }
        )
        break

      case 'cancel':
        response = await fetch(`${EWAY_API_BASE}/ewayapi/v1.03/ewayapi/cancewaybill`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authtoken': data.authToken,
          },
          body: JSON.stringify({
            ewbNo: data.ewbNo,
            cancelRsnCode: data.cancelRsnCode,
            cancelRmrk: data.cancelRmrk,
          }),
        })
        break

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const result = await response.json()

    return new Response(JSON.stringify(result), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
