import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TripStoreProvider } from './store/TripStore'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element #root not found')
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <TripStoreProvider>
        <App />
      </TripStoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
