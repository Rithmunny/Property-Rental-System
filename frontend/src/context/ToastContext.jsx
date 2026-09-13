import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CheckCircle2, className: 'bg-emerald-600 text-white' },
  error: { icon: XCircle, className: 'bg-red-600 text-white' },
  info: { icon: Info, className: 'bg-foreground text-background' },
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  // showToast(message) keeps the original signature; showToast(message, tone)
  // colors the pill for success / error / info feedback.
  const showToast = useCallback((message, tone = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, tone })
    timerRef.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const Icon = toast ? TONES[toast.tone]?.icon ?? Info : null

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
              TONES[toast.tone]?.className ?? TONES.info.className
            }`}
            role="status"
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
