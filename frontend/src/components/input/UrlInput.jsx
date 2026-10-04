/**
 * UrlInput — YouTube URL field + language selector
 */
import { useState } from 'react'
import { Link } from 'lucide-react'

export function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState('english')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) onSubmit(url.trim(), language)
  }

  const isValid = url.startsWith('http://') || url.startsWith('https://')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Link
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="input-base pl-10"
          disabled={loading}
          aria-label="YouTube meeting URL"
          id="youtube-url-input"
        />
      </div>

      <LanguageSelector value={language} onChange={setLanguage} disabled={loading} />

      <button
        type="submit"
        disabled={loading || !isValid}
        className="btn-primary w-full"
        id="analyze-youtube-btn"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" /> Submitting...
          </span>
        ) : (
          'Analyze Meeting →'
        )}
      </button>
    </form>
  )
}

export function LanguageSelector({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-text-muted">Language:</span>
      {[
        { id: 'english', label: 'English' },
        { id: 'hinglish', label: 'Hindi / Hinglish' },
      ].map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${
            disabled ? 'opacity-40 cursor-not-allowed' : ''
          } ${value === opt.id ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
        >
          <input
            type="radio"
            name="language"
            value={opt.id}
            checked={value === opt.id}
            onChange={() => !disabled && onChange(opt.id)}
            className="accent-accent-violet"
            disabled={disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
