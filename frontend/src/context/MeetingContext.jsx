/**
 * src/context/MeetingContext.jsx
 * ──────────────────────────────
 * Global state for the current meeting session.
 * Wraps the entire app so any component can access job/meeting data.
 */
import { createContext, useContext, useState } from 'react'

const MeetingContext = createContext(null)

export function MeetingProvider({ children }) {
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)   // full status object
  const [report, setReport] = useState(null)          // full MeetingReport
  const [chatHistory, setChatHistory] = useState([])  // [{role, content, sources?}]

  const resetSession = () => {
    setJobId(null)
    setJobStatus(null)
    setReport(null)
    setChatHistory([])
  }

  const addMessage = (role, content, sources = []) => {
    setChatHistory((prev) => [...prev, { role, content, sources }])
  }

  return (
    <MeetingContext.Provider
      value={{
        jobId, setJobId,
        jobStatus, setJobStatus,
        report, setReport,
        chatHistory,
        addMessage,
        resetSession,
      }}
    >
      {children}
    </MeetingContext.Provider>
  )
}

export function useMeeting() {
  const ctx = useContext(MeetingContext)
  if (!ctx) throw new Error('useMeeting must be used within MeetingProvider')
  return ctx
}
