import React from 'react'

// Simple toast implementation for now
export const Toaster: React.FC = () => {
  return (
    <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* Toasts will be rendered here */}
    </div>
  )
}