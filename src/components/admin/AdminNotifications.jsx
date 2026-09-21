import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, ShoppingBag, CreditCard, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, subscribeToNotifications } from '../../services/notificationService'
import toast from 'react-hot-toast'

const formatDistanceToNow = (date) => {
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function AdminNotifications({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(20),
        getUnreadCount()
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    // Subscribe to new notifications
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show toast for new notification
      toast((t) => (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <ShoppingBag size={16} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{newNotification.title}</p>
            <p className="text-xs text-gray-600">{newNotification.message}</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="flex-shrink-0">
            <X size={14} className="text-gray-400" />
          </button>
        </div>
      ), { duration: 5000, position: 'top-right' })
    })

    return () => unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const notif = notifications.find(n => n.id === notificationId)
      if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} })
    }
    if (onNotificationClick && notification.order_id) {
      onNotificationClick(notification.order_id)
    }
    setIsOpen(false)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag size={16} className="text-blue-600" />
      case 'payment_success':
        return <CreditCard size={16} className="text-green-600" />
      default:
        return <Bell size={16} className="text-gray-600" />
    }
  }

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date))
    } catch {
      return 'Just now'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'new_order' ? 'bg-blue-100' :
                          notification.type === 'payment_success' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          {getIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(notification.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
