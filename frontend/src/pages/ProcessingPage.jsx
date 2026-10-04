/**
 * pages/ProcessingPage.jsx
 * ─────────────────────────
 * Shown while the meeting is being processed.
 * Polls the job status endpoint every 2s and navigates to the dashboard on completion.
 */
import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { ProcessingPanel } from '../components/processing/ProcessingPanel'
import { useJobPolling } from '../hooks/useJobPolling'
import { useMeeting } from '../context/MeetingContext'

export default function ProcessingPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { jobStatus, setJobId } = useMeeting()

  // Sync jobId into context (handles page refresh)
  useEffect(() => {
    if (jobId) setJobId(jobId)
  }, [jobId])

  useJobPolling(jobId, {
    onDone: () => navigate(`/dashboard/${jobId}`),
    onError: () => { /* stay on page to show error state */ },
  })

  const status = jobStatus?.status || 'queued'
  const stepDetail = jobStatus?.step_detail || ''
  const errorMessage = jobStatus?.error_message || ''

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108,99,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-border-subtle">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-accent-violet flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-text-primary tracking-tight">
            SABHA AI
          </span>
        </Link>
        {status === 'error' && (
          <Link to="/" className="btn-ghost flex items-center gap-1.5 text-sm">
            <ArrowLeft size={14} /> Try again
          </Link>
        )}
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <ProcessingPanel
            status={status}
            stepDetail={stepDetail}
            errorMessage={errorMessage}
          />
        </div>
      </main>
    </div>
  )
}
