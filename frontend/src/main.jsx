import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { PropertiesProvider } from './context/PropertiesContext.jsx'
import { RequestsProvider } from './context/RequestsContext.jsx'
import { SavedProvider } from './context/SavedContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PropertiesProvider>
          <RequestsProvider>
            <SavedProvider>
              <App />
            </SavedProvider>
          </RequestsProvider>
        </PropertiesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
