/**
 * Processing status components
 */
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'

const STEPS = [
  { key: 'downloading', label: 'Downloading & preparing audio' },
  { key: 'transcribing', label: 'Transcribing speech to text' },
  { key: 'summarizing', label: 'Generating meeting summary' },
  { key: 'extracting', label: 'Extracting insights' },
  { key: 'indexing', label: 'Building knowledge index' },
]

const ORDER = ['queued', 'downloading', 'transcribing', 'summarizing', 'extracting', 'indexing', 'done']

function getStepState(stepKey, currentStatus) {
  const currentIdx = ORDER.indexOf(currentStatus)
  const stepIdx = ORDER.indexOf(stepKey)
  if (currentStatus === 'error') return 'error'
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

function StepRow({ label, state, detail }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {state === 'done' && <CheckCircle2 size={18} className="text-status-success" />}
        {state === 'active' && <Loader2 size={18} className="text-accent-violet animate-spin" />}
        {state === 'pending' && <Circle size={18} className="text-text-dim" />}
        {state === 'error' && <XCircle size={18} className="text-status-error" />}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-medium transition-colors ${
          state === 'done' ? 'text-text-muted' :
          state === 'active' ? 'text-text-primary' :
          'text-text-dim'
        }`}>
          {label}
        </p>
        {state === 'active' && detail && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{detail}</p>
        )}
      </div>
    </div>
  )
}

export function StepIndicator({ status, stepDetail }) {
  return (
    <div className="space-y-4">
      {STEPS.map((step) => (
        <StepRow
          key={step.key}
          label={step.label}
          state={getStepState(step.key, status)}
          detail={stepDetail}
        />
      ))}
    </div>
  )
}

export function ProcessingPanel({ status, stepDetail, errorMessage }) {
  const doneSteps = STEPS.filter(
    (s) => ORDER.indexOf(s.key) < ORDER.indexOf(status)
  ).length
  const progress = status === 'done'
    ? 100
    : Math.round((doneSteps / STEPS.length) * 100)

  return (
    <div className="card p-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-1">
        <h2 className="font-display font-semibold text-xl text-text-primary">
          Processing your meeting
        </h2>
        <p className="text-sm text-text-muted">
          This may take several minutes for longer recordings
        </p>
      </div>

      {/* Progress bar */}
      {status !== 'error' && (
        <div className="space-y-2">
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-violet rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-right">{progress}%</p>
        </div>
      )}

      <StepIndicator status={status} stepDetail={stepDetail} />

      {status === 'error' && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 text-sm text-status-error">
          <p className="font-medium mb-1">Processing failed</p>
          <p className="text-xs opacity-80">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}
