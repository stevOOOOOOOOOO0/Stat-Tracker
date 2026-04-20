import React, { useState, useEffect } from 'react'
import { useOfflineStatus } from '../../hooks/useOfflineStatus'

export function OfflineBanner() {
  const { isOnline } = useOfflineStatus()
  const [dismissed, setDismissed] = useState(false)

  // Re-show banner each time we go offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false)
    }
  }, [isOnline])

  if (isOnline || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-900/90 text-yellow-200 text-sm px-4 py-2 flex justify-between items-center">
      <span>You're offline — changes are saved locally.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss offline banner"
        className="text-yellow-200 hover:text-yellow-100 text-lg leading-none ml-4 transition-colors"
      >
        ×
      </button>
    </div>
  )
}
