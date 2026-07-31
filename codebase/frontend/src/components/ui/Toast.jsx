import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const push = useCallback((text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2400)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        className={[
          'fixed bottom-6 right-6 z-[120] rounded-2xl bg-[#163E68] px-4 py-3 text-sm font-semibold text-white',
          'shadow-[0_14px_35px_rgba(19,77,139,.28)] transition duration-200',
          message ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        ].join(' ')}
        role="status"
      >
        {message ?? ''}
      </div>
    </ToastContext.Provider>
  )
}
