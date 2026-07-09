import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage        from './pages/DashboardPage'
import ClientListPage       from './pages/ClientListPage'
import ClientDetailPage     from './pages/ClientDetailPage'
import JobListPage          from './pages/JobListPage'
import JobDetailPage        from './pages/JobDetailPage'
import PipelineBoardPage    from './pages/PipelineBoardPage'
import CandidatesListPage   from './pages/CandidatesListPage'
import CandidateProfilePage from './pages/CandidateProfilePage'
import ActivityLogPage      from './pages/ActivityLogPage'
import RemindersPage        from './pages/RemindersPage'
import FileWorkspacePage    from './pages/FileWorkspacePage'

export default function App() {
  return (
    <Routes>
      <Route path="/"                          element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"                 element={<DashboardPage />} />
      <Route path="/clients"                   element={<ClientListPage />} />
      <Route path="/clients/:clientId"         element={<ClientDetailPage />} />
      <Route path="/jobs"                      element={<JobListPage />} />
      <Route path="/jobs/:jobId"               element={<JobDetailPage />} />
      <Route path="/jobs/:jobId/pipeline"      element={<PipelineBoardPage />} />
      <Route path="/candidates"                element={<CandidatesListPage />} />
      <Route path="/candidates/:candidateId"   element={<CandidateProfilePage />} />
      <Route path="/activity"                  element={<ActivityLogPage />} />
      <Route path="/reminders"                 element={<RemindersPage />} />
      <Route path="/files"                     element={<FileWorkspacePage />} />
    </Routes>
  )
}
