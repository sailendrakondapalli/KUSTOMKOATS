import api from './apiClient'

export async function fetchAddresses(userId) {
  try {
    const response = await api.profile.getAddresses()
    return response.data || []
  } catch (error) {
    console.error('Error fetching addresses:', error)
    throw error
  }
}

export async function saveAddress(userId, addr) {
  try {
    const response = await api.profile.addAddress(addr)
    return response.data
  } catch (error) {
    console.error('Error saving address:', error)
    throw error
  }
}

export async function updateAddress(id, userId, updates) {
  try {
    const response = await api.profile.updateAddress(id, updates)
    return response.data
  } catch (error) {
    console.error('Error updating address:', error)
    throw error
  }
}

export async function deleteAddress(id, userId) {
  try {
    await api.profile.deleteAddress(id)
  } catch (error) {
    console.error('Error deleting address:', error)
    throw error
  }
}

export async function setDefaultAddress(id, userId) {
  try {
    // Implement via update with is_active flag or add dedicated endpoint
    await api.profile.updateAddress(id, { is_default: true })
  } catch (error) {
    console.error('Error setting default address:', error)
    throw error
  }
}
