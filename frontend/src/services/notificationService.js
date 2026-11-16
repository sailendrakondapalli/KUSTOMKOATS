// Note: Notifications need backend API endpoints
// This service is updated to use REST API instead of Supabase direct queries
// Realtime functionality is removed - consider polling or Server-Sent Events

/**
 * Fetch admin notifications
 * TODO: Create backend endpoint GET /api/notifications
 */
export async function fetchNotifications(limit = 50) {
  try {
    // Placeholder - needs backend endpoint
    console.warn('fetchNotifications needs backend endpoint: GET /api/notifications')
    return []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

/**
 * Get unread notification count
 * TODO: Create backend endpoint GET /api/notifications/unread/count
 */
export async function getUnreadCount() {
  try {
    // Placeholder - needs backend endpoint
    console.warn('getUnreadCount needs backend endpoint: GET /api/notifications/unread/count')
    return 0
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 * TODO: Create backend endpoint PUT /api/notifications/:id/read
 */
export async function markAsRead(notificationId) {
  try {
    // Placeholder - needs backend endpoint
    console.warn(`markAsRead needs backend endpoint: PUT /api/notifications/${notificationId}/read`)
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read
 * TODO: Create backend endpoint PUT /api/notifications/read-all
 */
export async function markAllAsRead() {
  try {
    // Placeholder - needs backend endpoint
    console.warn('markAllAsRead needs backend endpoint: PUT /api/notifications/read-all')
    return true
  } catch (error) {
    console.error('Error marking all as read:', error)
    throw error
  }
}

/**
 * Subscribe to new notifications
 * REMOVED: Realtime subscriptions not supported via REST API
 * Consider implementing polling or Server-Sent Events on backend
 */
export function subscribeToNotifications(callback) {
  console.warn('Real-time notifications not supported. Implement polling or SSE instead.')
  
  // Return empty unsubscribe function
  return () => {}
}

/**
 * Delete notification
 * TODO: Create backend endpoint DELETE /api/notifications/:id
 */
export async function deleteNotification(notificationId) {
  try {
    // Placeholder - needs backend endpoint
    console.warn(`deleteNotification needs backend endpoint: DELETE /api/notifications/${notificationId}`)
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}
