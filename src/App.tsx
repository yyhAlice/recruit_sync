import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage          from './pages/DashboardPage'
import ClientListPage         from './pages/ClientListPage'
import ClientDetailPage       from './pages/ClientDetailPage'
import JobListPage            from './pages/JobListPage'
import JobDetailPage          from './pages/JobDetailPage'
import PipelineBoardPage      from './pages/PipelineBoardPage'
import PipelineOverviewPage   from './pages/PipelineOverviewPage'
import CandidatesListPage     from './pages/CandidatesListPage'
import CandidateProfilePage   from './pages/CandidateProfilePage'
import ActivityLogPage        from './pages/ActivityLogPage'
import RemindersPage          from './pages/RemindersPage'
import FileWorkspacePage      from './pages/FileWorkspacePage'
import WorkspaceHomePage      from './pages/workspace/WorkspaceHomePage'
import WorkspacePage          from './pages/workspace/WorkspacePage'
import CVDashboardPage        from './pages/cv/CVDashboardPage'
import CVUploadPage           from './pages/cv/CVUploadPage'
import CVReviewPage           from './pages/cv/CVReviewPage'
import CVMappingPage          from './pages/cv/CVMappingPage'
import CVTemplatesPage        from './pages/cv/CVTemplatesPage'
import CVPreviewPage          from './pages/cv/CVPreviewPage'
import CVHistoryPage          from './pages/cv/CVHistoryPage'
import CVTemplateManagePage   from './pages/cv/CVTemplateManagePage'

export default function App() {
  return (
    <Routes>
      <Route path="/"                          element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"                 element={<DashboardPage />} />
      <Route path="/clients"                   element={<ClientListPage />} />
      <Route path="/clients/:clientId"         element={<ClientDetailPage />} />
      <Route path="/jobs"                      element={<JobListPage />} />
      <Route path="/jobs/:jobId"               element={<JobDetailPage />} />
      <Route path="/pipeline"                  element={<PipelineOverviewPage />} />
      <Route path="/jobs/:jobId/pipeline"      element={<PipelineBoardPage />} />
      <Route path="/candidates"                element={<CandidatesListPage />} />
      <Route path="/candidates/:candidateId"   element={<CandidateProfilePage />} />
      <Route path="/activity"                  element={<ActivityLogPage />} />
      <Route path="/reminders"                 element={<RemindersPage />} />
      <Route path="/files"                     element={<FileWorkspacePage />} />
      <Route path="/workspace"                 element={<WorkspaceHomePage />} />
      <Route path="/workspace/client/:clientId"     element={<WorkspacePage entityType="client" />} />
      <Route path="/workspace/job/:jobId"           element={<WorkspacePage entityType="job" />} />
      <Route path="/workspace/candidate/:candidateId" element={<WorkspacePage entityType="candidate" />} />
      <Route path="/cv"                        element={<CVDashboardPage />} />
      <Route path="/cv/upload"                 element={<CVUploadPage />} />
      <Route path="/cv/review"                 element={<CVReviewPage />} />
      <Route path="/cv/mapping"                element={<CVMappingPage />} />
      <Route path="/cv/templates"              element={<CVTemplatesPage />} />
      <Route path="/cv/preview"               element={<CVPreviewPage />} />
      <Route path="/cv/history"               element={<CVHistoryPage />} />
      <Route path="/cv/templates/manage"       element={<CVTemplateManagePage />} />
    </Routes>
  )
}
