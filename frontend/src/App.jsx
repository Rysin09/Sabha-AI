/**
 * src/App.jsx
 * ─────────────
 * Root component: sets up React Router routes and wraps everything
 * in the MeetingProvider context.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MeetingProvider } from './context/MeetingContext'
import HomePage from './pages/HomePage'
import ProcessingPage from './pages/ProcessingPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <MeetingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/processing/:jobId" element={<ProcessingPage />} />
          <Route path="/dashboard/:jobId" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MeetingProvider>
  )
}
