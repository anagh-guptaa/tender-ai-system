import { useEffect, useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import { generateTenderDossier } from '../lib/gemini'
import { saveTenderDossier } from '../lib/api'

// Parses inline markdown like **bold**, *italic*, and `code`
function renderInlineMarkdown(text) {
  if (!text) return null
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  const parts = text.split(tokenRegex)

  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-ink-950">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-ink-800">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="rounded bg-ink-900/5 px-1.5 py-0.5 font-mono text-xs text-ink-900">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

// Renders markdown dossier text in a clean, human-readable format
function DossierText({ text }) {
  if (!text) return null
  const lines = text.split('\n')

  return (
    <div className="flex flex-col gap-2 text-sm text-ink-900 leading-relaxed pt-1">
      {lines.map((rawLine, i) => {
        const line = rawLine.trim()
        if (!line) return null

        // Check for Section Headers (#, ##, ###, #### or short standalone title names)
        const isHeading =
          line.startsWith('#') ||
          /^(TL;DR|Scope of Work|Key Requirements|Financial Snapshot|Risk Flags|AI Recommendation|Recommendation)$/i.test(
            line.replace(/\*\*/g, '').trim()
          )

        if (isHeading) {
          const titleText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim()
          return (
            <h3
              key={i}
              className="mt-4 first:mt-1 mb-1 font-display text-base font-semibold text-ink-900 border-b border-brass-500/20 pb-1 flex items-center gap-2"
            >
              {titleText}
            </h3>
          )
        }

        // Check for Bullet Items (- , * , • , + , or 1. , 2. )
        const isBullet = /^(?:[-*•+]\s+|\d+\.\s+)/.test(line)
        if (isBullet) {
          const content = line.replace(/^(?:[-*•+]\s+|\d+\.\s+)/, '')
          return (
            <div key={i} className="flex items-start gap-2.5 pl-1 my-0.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
              <div className="flex-1 text-sm text-ink-900 leading-relaxed">
                {renderInlineMarkdown(content)}
              </div>
            </div>
          )
        }

        // Regular Paragraph
        return (
          <p key={i} className="text-sm text-ink-900 leading-relaxed my-0.5">
            {renderInlineMarkdown(line)}
          </p>
        )
      })}
    </div>
  )
}

export default function AIDossier({ tender }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [dossier, setDossier] = useState(tender.ai_dossier || null)
  const [error, setError] = useState('')

  // If we already have a cached dossier in the DB, show it immediately
  useEffect(() => {
    if (tender.ai_dossier) {
      setDossier(tender.ai_dossier)
      setStatus('done')
    }
  }, [tender.ai_dossier])

  async function generate() {
    if (dossier) {
      setOpen((o) => !o)
      return
    }
    setOpen(true)
    setStatus('loading')
    setError('')
    try {
      const text = await generateTenderDossier(tender)
      setDossier(text)
      setStatus('done')
      // Cache in DB (best-effort, don't block UI)
      saveTenderDossier(tender.id, text).catch(() => {})
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const isGeminiMissing = !import.meta.env.VITE_GEMINI_API_KEY

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/5 to-transparent">
      {/* Header / trigger */}
      <button
        onClick={generate}
        disabled={status === 'loading' || isGeminiMissing}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-500/15">
            {status === 'loading' ? (
              <Loader2 size={16} className="animate-spin text-brass-600" />
            ) : (
              <Sparkles size={16} className="text-brass-600" />
            )}
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink-900">
              {status === 'loading' ? 'Generating AI dossier…' : 'AI Tender Dossier'}
            </p>
            <p className="text-xs text-signal-slate">
              {isGeminiMissing
                ? 'Add VITE_GEMINI_API_KEY to .env to enable'
                : dossier
                ? 'AI-generated brief — click to expand'
                : 'Plain-language brief · eligibility snapshot · risk flags'}
            </p>
          </div>
        </div>
        {!isGeminiMissing && (
          <div className="shrink-0 text-signal-slate">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>

      {/* Content */}
      {open && status === 'done' && dossier && (
        <div className="border-t border-brass-500/20 px-5 pb-5 pt-4">
          <DossierText text={dossier} />
          <p className="mt-4 text-xs text-signal-slate/70">
            Generated by TenderAI · Gemini 2.0 Flash · For guidance only, verify with the official NIT
          </p>
        </div>
      )}

      {open && status === 'error' && (
        <div className="border-t border-brass-500/20 px-5 pb-5 pt-4">
          <div className="flex items-start gap-2 text-sm text-signal-rust">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
