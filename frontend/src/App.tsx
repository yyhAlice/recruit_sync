import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ClientListPage from './pages/ClientListPage'
import ClientDetailPage from './pages/ClientDetailPage'
import JobListPage from './pages/JobListPage'
import JobDetailPage from './pages/JobDetailPage'
import PipelineBoardPage from './pages/PipelineBoardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/clients" element={<ClientListPage />} />
      <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      <Route path="/jobs" element={<JobListPage />} />
      <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      <Route path="/jobs/:jobId/pipeline" element={<PipelineBoardPage />} />
    </Routes>
  )
}
