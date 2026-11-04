// Test Razorpay Integration
// Open browser console and run: testRazorpayIntegration()

export async function testRazorpayIntegration() {
  console.log('🔍 Testing Razorpay Integration...\n')
  
  // Test 1: Check environment variables
  console.log('1️⃣ Environment Variables:')
  console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('   VITE_RAZORPAY_KEY_ID:', import.meta.env.VITE_RAZORPAY_KEY_ID)
  console.log('   Key starts with rzp_live?', import.meta.env.VITE_RAZORPAY_KEY_ID?.startsWith('rzp_live_'))
  
  // Test 2: Test Edge Function call
  console.log('\n2️⃣ Testing Edge Function...')
  
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    
    console.log('   Calling create-razorpay-order...')
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount: 100, // ₹100 test
        currency: 'INR',
        receipt: `test_${Date.now()}`
      }
    })
    
    if (error) {
      console.error('   ❌ Edge Function Error:', error)
      return { success: false, error }
    }
    
    if (!data.success) {
      console.error('   ❌ Razorpay Error:', data.error)
      return { success: false, error: data.error }
    }
    
    console.log('   ✅ Edge Function Success!')
    console.log('   Order ID:', data.order.id)
    console.log('   Amount:', data.order.amount / 100)
    console.log('   Currency:', data.order.currency)
    
    return { success: true, order: data.order }
    
  } catch (err) {
    console.error('   ❌ Unexpected Error:', err)
    return { success: false, error: err.message }
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testRazorpayIntegration = testRazorpayIntegration
}
