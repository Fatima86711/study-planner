import React from 'react'
import { MdClose } from 'react-icons/md'

const AlertModal = ({ isOpen, title, message, type = 'info', onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    const tealGreen = '#1D9E75'
    switch (type) {
      case 'success':
        return { bg: tealGreen, icon: '✓' }
      case 'error':
        return { bg: tealGreen, icon: '✕' }
      case 'warning':
        return { bg: tealGreen, icon: '⚠' }
      case 'info':
      default:
        return { bg: tealGreen, icon: 'ℹ' }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[90vw] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-4 p-6" style={{ backgroundColor: styles.bg }}>
          <div className="text-4xl text-white">{styles.icon}</div>
          <h2 className="text-xl font-semibold text-white flex-1">{title}</h2>
          <button
            onClick={onCancel}
            className="text-white rounded-full p-2 transition-all flex-shrink-0 hover:text-red-500 hover:bg-white hover:bg-opacity-20"
            style={{ opacity: 0.95 }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: styles.bg }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AlertModal
