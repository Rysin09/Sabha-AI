/**
 * pages/DashboardPage.jsx
 * ────────────────────────
 * Meeting intelligence dashboard — shows report + chat side by side.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Plus } from 'lucide-react'
import { MeetingHeader } from '../components/dashboard/MeetingHeader'
import {
  SummaryCard,
  ActionItemsCard,
  DecisionsCard,
  QuestionsCard,
  TranscriptViewer,
} from '../components/dashboard/DashboardCards'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ExportButtons } from '../components/export/ExportButtons'
import { getMeetingReport } from '../services/api'
import { useMeeting } from '../context/MeetingContext'

// Skeleton loader for content that's still fetching
function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton h-4 rounded ${className}`} />
}

function ReportSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <SkeletonBlock className="h-6 w-2/3" />
      <SkeletonBlock className="w-1/3" />
      <div className="divider" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-5 space-y-2">
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock />
          <SkeletonBlock className="w-4/5" />
          <SkeletonBlock className="w-3/5" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { report, setReport, setJobId, resetSession } = useMeeting()
  const [fetchError, setFetchError] = useState('')
  const [loading, setLoading] = useState(!report)

  // Sync jobId into context (handles page refresh)
  useEffect(() => {
    if (jobId) setJobId(jobId)
  }, [jobId])

  // Fetch report if not already in context
  useEffect(() => {
    if (report) { setLoading(false); return }
    if (!jobId) return

    getMeetingReport(jobId)
      .then((data) => {
        setReport(data)
        setLoading(false)
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || 'Failed to load meeting report.'
        setFetchError(msg)
        setLoading(false)
      })
  }, [jobId, report])

  const handleNewMeeting = () => {
    resetSession()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-primary/95 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-violet flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-text-primary tracking-tight">
            SABHA AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {report && <ExportButtons jobId={jobId} />}
          <button
            onClick={handleNewMeeting}
            className="btn-ghost flex items-center gap-1.5 text-sm"
            id="new-meeting-btn"
          >
            <Plus size={14} /> New Meeting
          </button>
        </div>
      </header>

      {/* Main layout: 2-col on lg+, stacked on smaller */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* ── Left column: Meeting report ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 lg:max-w-2xl xl:max-w-3xl"
          id="meeting-report"
        >
          {fetchError && (
            <div className="card p-6 text-center space-y-2">
              <p className="text-status-error font-medium">Could not load report</p>
              <p className="text-sm text-text-muted">{fetchError}</p>
              <button onClick={() => navigate('/')} className="btn-secondary text-sm mt-2">
                Back to home
              </button>
            </div>
          )}

          {loading && !fetchError && <ReportSkeleton />}

          {report && !loading && (
            <>
              <MeetingHeader
                title={report.title}
                source={report.source}
                language={report.language}
                processedAt={report.processed_at}
              />
              <SummaryCard summary={report.summary} />
              <ActionItemsCard actionItems={report.action_items} />
              <DecisionsCard keyDecisions={report.key_decisions} />
              <QuestionsCard openQuestions={report.open_questions} />
              <TranscriptViewer transcript={report.transcript} />
            </>
          )}
        </motion.div>

        {/* ── Right column: Chat ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:w-[400px] xl:w-[460px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-border-subtle
                     flex flex-col"
          style={{ height: 'calc(100vh - 65px)' }}
          id="chat-column"
        >
          {report ? (
            <ChatPanel jobId={jobId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-dim text-sm">
              Loading chat...
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
