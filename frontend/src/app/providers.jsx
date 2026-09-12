import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { PropertiesProvider } from '@/context/PropertiesContext'
import { RequestsProvider } from '@/context/RequestsContext'
import { SavedProvider } from '@/context/SavedContext'
import { MessagesProvider } from '@/context/MessagesContext'
import { AlertsProvider } from '@/context/AlertsContext'
import { ToastProvider } from '@/context/ToastContext'

export default function AppProviders({ children }) {
  return (
    // reducedMotion="user" disables transform animations for anyone with
    // prefers-reduced-motion set, while opacity fades still communicate state.
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AuthProvider>
          <PropertiesProvider>
            <RequestsProvider>
              <SavedProvider>
                <MessagesProvider>
                  <AlertsProvider>
                    <ToastProvider>{children}</ToastProvider>
                  </AlertsProvider>
                </MessagesProvider>
              </SavedProvider>
            </RequestsProvider>
          </PropertiesProvider>
        </AuthProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}
