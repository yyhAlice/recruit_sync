import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { CVProvider } from './context/CVContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { CandidateProvider } from './context/CandidateContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <WorkspaceProvider>
        <CandidateProvider>
          <CVProvider>
            <App />
          </CVProvider>
        </CandidateProvider>
      </WorkspaceProvider>
    </HashRouter>
  </React.StrictMode>
)
