import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { isApprovedWholesaler } from '../utils/wholesaleUtils'

/**
 * Hook to check if current user is an approved wholesaler
 * @returns {Object} - { isWholesaler: boolean, loading: boolean }
 */
export function useWholesaler() {
  const { user } = useAuthStore()
  const [isWholesaler, setIsWholesaler] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkWholesalerStatus() {
      if (!user?.email) {
        setIsWholesaler(false)
        setLoading(false)
        return
      }

      setLoading(true)
      const approved = await isApprovedWholesaler(user.email)
      setIsWholesaler(approved)
      setLoading(false)
    }

    checkWholesalerStatus()
  }, [user])

  return { isWholesaler, loading }
}
