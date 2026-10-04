/**
 * src/hooks/useJobPolling.js
 * ───────────────────────────
 * Custom hook that polls /api/job/{id}/status every 2s until done or error.
 * Automatically clears the interval when the component unmounts.
 */
import { useEffect, useRef } from 'react'
import { getJobStatus } from '../services/api'
import { useMeeting } from '../context/MeetingContext'

const POLL_INTERVAL_MS = 2000

export function useJobPolling(jobId, { onDone, onError } = {}) {
  const { setJobStatus } = useMeeting()
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!jobId) return

    const poll = async () => {
      try {
        const status = await getJobStatus(jobId)
        setJobStatus(status)

        if (status.status === 'done') {
          clearInterval(intervalRef.current)
          onDone?.(status)
        } else if (status.status === 'error') {
          clearInterval(intervalRef.current)
          onError?.(status.error_message || 'An unknown error occurred.')
        }
      } catch (err) {
        // Network errors: keep polling, don't crash
        console.warn('Polling error:', err.message)
      }
    }

    poll() // immediate first call
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => clearInterval(intervalRef.current)
  }, [jobId])
}
