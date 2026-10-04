/**
 * src/services/api.js
 * ─────────────────────
 * Axios instance + typed wrappers for every Sabha-AI API endpoint.
 * The base URL comes from the Vite proxy in dev, or VITE_API_BASE_URL in production.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
})

// ── Health ────────────────────────────────────────────────────────────────────

export const checkHealth = () => api.get('/health', { baseURL: '' })

// ── Processing ────────────────────────────────────────────────────────────────

/**
 * Submit a YouTube URL for processing.
 * @param {string} url
 * @param {"english"|"hinglish"} language
 * @returns {Promise<{job_id: string, status: string}>}
 */
export const processYoutube = (url, language = 'english') =>
  api.post('/process/youtube', { url, language }).then((r) => r.data)

// processUpload removed as FFmpeg processing is disabled
// ── Job status ────────────────────────────────────────────────────────────────

/**
 * Poll a job's processing status.
 * @param {string} jobId
 * @returns {Promise<{job_id, status, step_detail, error_message}>}
 */
export const getJobStatus = (jobId) =>
  api.get(`/job/${jobId}/status`).then((r) => r.data)

// ── Meeting report ────────────────────────────────────────────────────────────

/**
 * Retrieve the full meeting report once processing is done.
 * @param {string} jobId
 * @returns {Promise<MeetingReport>}
 */
export const getMeetingReport = (jobId) =>
  api.get(`/meeting/${jobId}`).then((r) => r.data)

// ── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Ask a question about the meeting.
 * @param {string} jobId
 * @param {string} question
 * @param {Array<{role: string, content: string}>} history
 * @returns {Promise<{answer: string, sources: Array}>}
 */
export const sendChatMessage = (jobId, question, history = []) =>
  api.post('/chat', { job_id: jobId, question, history }).then((r) => r.data)

// ── Export ────────────────────────────────────────────────────────────────────

/** Returns a URL string for the PDF download link. */
export const getPdfUrl = (jobId) => `${BASE_URL}/export/${jobId}/pdf`

/** Returns a URL string for the TXT download link. */
export const getTxtUrl = (jobId) => `${BASE_URL}/export/${jobId}/txt`
