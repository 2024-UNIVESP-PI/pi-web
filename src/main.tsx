import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AdminProvider } from './contexts/AdminContext'
import CaixaContext from './contexts/CaixaContext'
import Router from './router'

import './global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <CaixaContext.Provider>
        <Router />
      </CaixaContext.Provider>
    </AdminProvider>
  </StrictMode>
)
