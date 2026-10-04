/**
 * MeetingHeader — title, source, language, processed date
 */
import { Globe, Upload, Calendar } from 'lucide-react'

export function MeetingHeader({ title, source, language, processedAt }) {
  const isYoutube = source?.startsWith('http')
  const date = processedAt ? new Date(processedAt).toLocaleString() : null

  return (
    <div className="space-y-2 pb-5 border-b border-border-subtle">
      <h1 className="font-display font-bold text-2xl text-text-primary leading-tight">
        {title || 'Meeting Report'}
      </h1>
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          {isYoutube ? <Globe size={12} /> : <Upload size={12} />}
          <span className="truncate max-w-xs" title={source}>{source}</span>
        </span>
        <span className="badge-violet capitalize">{language}</span>
        {date && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {date}
          </span>
        )}
      </div>
    </div>
  )
}
