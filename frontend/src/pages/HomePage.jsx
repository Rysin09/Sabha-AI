/**
 * pages/HomePage.jsx
 * ───────────────────
 * Landing page: Sabha AI branding + YouTube URL / file upload input
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { UrlInput } from '../components/input/UrlInput'
import { processYoutube } from '../services/api'
import { useMeeting } from '../context/MeetingContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { setJobId, resetSession } = useMeeting()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleYoutubeSubmit = async (url, language) => {
    setError('')
    setLoading(true)
    resetSession()
    try {
      const { job_id } = await processYoutube(url, language)
      setJobId(job_id)
      navigate(`/processing/${job_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Subtle background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108,99,255,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-violet flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-text-primary tracking-tight">
            SABHA AI
          </span>
        </div>
        <span className="text-xs text-text-dim hidden sm:block">
          Meeting Intelligence Platform
        </span>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg space-y-10"
        >
          {/* Headline */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 badge-violet mb-2">
              <Sparkles size={11} />
              AI Meeting Intelligence
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-text-primary leading-tight">
              Meeting Intelligence,{' '}
              <span className="text-accent-violet">Elevated.</span>
            </h1>
            <p className="text-text-muted text-base max-w-sm mx-auto leading-relaxed">
              Transcribe, summarize, extract insights, and have conversations with any meeting.
            </p>
          </div>

          {/* Input card */}
          <div className="card p-6">
            <UrlInput onSubmit={handleYoutubeSubmit} loading={loading} />

            <p className="text-xs text-text-muted mt-4 text-center">
              Supports YouTube and other yt-dlp-compatible URLs.
            </p>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-status-error mt-3 text-center"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Auto-transcription',
              'Smart summaries',
              'Action items',
              'Key decisions',
              'RAG Q&A',
              'PDF export',
            ].map((f) => (
              <span key={f} className="badge bg-bg-elevated text-text-muted border border-border-subtle text-xs">
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-text-dim border-t border-border-subtle">
        Sabha AI · Meeting Intelligence Platform
      </footer>
    </div>
  )
}
