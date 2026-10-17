import { createShiprocketOrder } from '../services/shiprocketService'

/**
 * Test Shiprocket Integration
 * Call this from browser console: testShiprocketIntegration()
 */
export async function testShiprocketIntegration() {
  console.log('🔍 Testing Shiprocket Integration...')
  
  // Test order data
  const testOrderData = {
    order_id: `TEST_${Date.now()}`,
    order_date: new Date().toISOString().split('T')[0],
    customer_name: 'Test Customer',
    customer_last_name: '',
    customer_email: 'test@example.com',
    customer_phone: '9876543210',
    billing_address: '123 Test Street',
    billing_address_2: 'Near Test Mall',
    billing_city: 'Hyderabad',
    billing_pincode: '500001',
    billing_state: 'Telangana',
    billing_country: 'India',
    shipping_is_billing: true,
    order_items: [
      {
        name: 'Test Product',
        sku: 'TEST-001',
        units: 1,
        selling_price: 999,
        discount: 0,
        tax: 0,
        hsn: ''
      }
    ],
    payment_method: 'Prepaid',
    sub_total: 999,
    shipping_charges: 0,
    total_discount: 0,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5
  }
  
  console.log('📦 Test Order Data:', testOrderData)
  
  try {
    console.log('🚀 Calling createShiprocketOrder...')
    const result = await createShiprocketOrder(testOrderData)
    console.log('✅ Shiprocket Order Created Successfully!')
    console.log('📄 Response:', result)
    return result
  } catch (error) {
    console.error('❌ Shiprocket Test Failed:', error)
    console.error('Error Details:', error.message)
    throw error
  }
}

// Auto-attach to window for easy console access
if (typeof window !== 'undefined') {
  window.testShiprocketIntegration = testShiprocketIntegration
}
