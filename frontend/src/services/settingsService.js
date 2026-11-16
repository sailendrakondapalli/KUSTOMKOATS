import api from './apiClient'

export async function getSetting(key) {
  try {
    const response = await api.content.getSetting(key)
    return response.data?.value || null
  } catch (error) {
    console.error('Error getting setting:', error)
    return null
  }
}

export async function setSetting(key, value) {
  try {
    await api.content.updateSetting(key, value)
  } catch (error) {
    console.error('[setSetting] Error:', error)
    throw error
  }
}
