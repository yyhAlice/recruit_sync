import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { CVProvider } from './context/CVContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <WorkspaceProvider>
        <CVProvider>
          <App />
        </CVProvider>
      </WorkspaceProvider>
    </HashRouter>
  </React.StrictMode>
)
