import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import CaixaContext from './contexts/CaixaContext'
import Router from './router'

import './global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CaixaContext.Provider>
      <Router />
    </CaixaContext.Provider>
  </StrictMode>,
)
