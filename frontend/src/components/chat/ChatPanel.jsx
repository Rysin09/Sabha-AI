/**
 * Chat components — ChatPanel, ChatMessage, ChatInput, SourceCitations
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronDown, ChevronUp, MessageSquare, Bot, User } from 'lucide-react'
import { sendChatMessage } from '../../services/api'
import { useMeeting } from '../../context/MeetingContext'

// ── Source Citations ──────────────────────────────────────────────────────────

function SourceCitations({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-accent-teal hover:text-accent-teal/80 transition-colors"
        aria-expanded={open}
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Sources ({sources.length})
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {sources.map((src, i) => (
                <div
                  key={i}
                  className="bg-bg-elevated rounded-lg px-3 py-2 border-l-2 border-accent-teal/40"
                >
                  <p className="text-xs text-text-muted mb-1">Chunk #{src.chunk_index}</p>
                  <p className="text-xs text-text-primary leading-relaxed line-clamp-3">
                    {src.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Chat Message ──────────────────────────────────────────────────────────────

function ChatMessage({ role, content, sources }) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs
        ${isUser
          ? 'bg-accent-violet/20 text-accent-violet'
          : 'bg-accent-teal/20 text-accent-teal'
        }`}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent-violet text-white rounded-tr-sm'
              : 'bg-bg-elevated text-text-primary rounded-tl-sm border border-border-subtle'
          }`}
        >
          {content}
        </div>
        {!isUser && <SourceCitations sources={sources} />}
      </div>
    </motion.div>
  )
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <div className="w-7 h-7 rounded-full bg-accent-teal/20 flex items-center justify-center">
        <Bot size={13} className="text-accent-teal" />
      </div>
      <div className="bg-bg-elevated border border-border-subtle px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Chat Input ────────────────────────────────────────────────────────────────

function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault()
      onSend(text.trim())
      setText('')
    }
  }

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <div className="flex gap-2 items-end border-t border-border-subtle pt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about this meeting..."
        rows={1}
        disabled={disabled}
        className="input-base flex-1 resize-none min-h-[44px] max-h-32 py-2.5 text-sm"
        id="chat-input"
        style={{ height: 'auto', overflowY: 'auto' }}
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="btn-primary py-2.5 px-3 flex-shrink-0"
        aria-label="Send message"
        id="chat-send-btn"
      >
        <Send size={16} />
      </button>
    </div>
  )
}

// ── Chat Panel ────────────────────────────────────────────────────────────────

export function ChatPanel({ jobId }) {
  const { chatHistory, addMessage } = useMeeting()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  const handleSend = async (question) => {
    setError('')
    addMessage('user', question)
    setLoading(true)

    try {
      const res = await sendChatMessage(jobId, question, chatHistory)
      addMessage('assistant', res.answer, res.sources)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to get a response. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col h-full" id="chat-panel">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border-subtle flex-shrink-0">
        <MessageSquare size={16} className="text-accent-teal" />
        <h3 className="font-display font-semibold text-sm text-text-primary">
          Chat with this meeting
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {chatHistory.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="w-10 h-10 rounded-full bg-accent-teal/15 flex items-center justify-center">
              <Bot size={20} className="text-accent-teal" />
            </div>
            <p className="text-sm text-text-muted max-w-xs">
              Ask me anything about this meeting — decisions, action items, who said what, or anything else.
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <p className="text-xs text-status-error text-center px-4">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 flex-shrink-0">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}
