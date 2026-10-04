/**
 * Dashboard section cards
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, ListChecks, Lightbulb, HelpCircle } from 'lucide-react'

function SectionCard({ icon: Icon, title, content, defaultOpen = true, id }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="card p-5 space-y-3 animate-slide-up" id={id}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 group"
        aria-expanded={open}
      >
        <span className="section-heading mb-0">
          <Icon size={16} className="text-accent-violet" />
          {title}
        </span>
        <span className="text-text-muted group-hover:text-text-primary transition-colors">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap pt-1 border-t border-border-subtle">
          {content || <span className="text-text-muted italic">No data available.</span>}
        </div>
      )}
    </div>
  )
}

export function SummaryCard({ summary }) {
  return (
    <SectionCard
      icon={FileText}
      title="Summary"
      content={summary}
      defaultOpen={true}
      id="summary-card"
    />
  )
}

export function ActionItemsCard({ actionItems }) {
  return (
    <SectionCard
      icon={ListChecks}
      title="Action Items"
      content={actionItems}
      defaultOpen={true}
      id="action-items-card"
    />
  )
}

export function DecisionsCard({ keyDecisions }) {
  return (
    <SectionCard
      icon={Lightbulb}
      title="Key Decisions"
      content={keyDecisions}
      defaultOpen={true}
      id="decisions-card"
    />
  )
}

export function QuestionsCard({ openQuestions }) {
  return (
    <SectionCard
      icon={HelpCircle}
      title="Open Questions & Follow-ups"
      content={openQuestions}
      defaultOpen={false}
      id="questions-card"
    />
  )
}

export function TranscriptViewer({ transcript }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card p-5 space-y-3" id="transcript-viewer">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 group"
        aria-expanded={open}
      >
        <span className="section-heading mb-0">
          <FileText size={16} className="text-text-muted" />
          Full Transcript
        </span>
        <span className="text-xs text-text-muted group-hover:text-text-primary flex items-center gap-1">
          {open ? 'Hide' : 'Show'}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div className="max-h-96 overflow-y-auto text-sm text-text-muted leading-relaxed whitespace-pre-wrap pt-3 border-t border-border-subtle font-mono text-xs">
          {transcript || 'Transcript not available.'}
        </div>
      )}
    </div>
  )
}
