import { useEffect, useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { generateEligibilityReport } from '../lib/gemini'
import { getEligibilityReport, saveEligibilityReport } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const VERDICT_CONFIG = {
  GO: {
    label: 'GO',
    color: 'text-signal-green',
    bg: 'bg-signal-green-bg border-signal-green/30',
    icon: CheckCircle2,
  },
  PARTIAL: {
    label: 'PARTIAL',
    color: 'text-brass-600',
    bg: 'bg-brass-500/10 border-brass-500/30',
    icon: AlertTriangle,
  },
  'NO-GO': {
    label: 'NO-GO',
    color: 'text-signal-rust',
    bg: 'bg-signal-rust-bg border-signal-rust/30',
    icon: XCircle,
  },
}

export default function EligibilityReport({ tender }) {
  const { user, company } = useAuth()
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !company) return
    // Try to load cached report
    getEligibilityReport(user.id, tender.id)
      .then((r) => { if (r) { setReport(r); setStatus('done') } })
      .catch(() => {})
  }, [user, company, tender.id])

  async function runCheck() {
    if (!company) return
    setStatus('loading')
    setError('')
    try {
      const result = await generateEligibilityReport(tender, company)
      const saved = await saveEligibilityReport({
        company_id: user.id,
        tender_id: tender.id,
        score: result.score,
        verdict: result.verdict,
        matched: result.matched,
        missing_criteria: result.missing_criteria,
        missing_docs: result.missing_docs,
        reasoning: result.reasoning,
        generated_at: new Date().toISOString(),
      })
      setReport(saved)
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  // Not logged in or no profile
  if (!company) {
    return (
      <div className="rounded-xl border border-ink-900/10 bg-white p-5">
        <p className="text-sm font-medium text-ink-900">Eligibility check</p>
        <p className="mt-1 text-xs text-signal-slate">
          Complete your company profile to get an AI eligibility verdict for this tender.
        </p>
      </div>
    )
  }

  const cfg = report ? VERDICT_CONFIG[report.verdict] ?? VERDICT_CONFIG['PARTIAL'] : null

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-brass-600" />
          <p className="font-display text-base font-medium text-ink-900">Eligibility check</p>
        </div>
        {status === 'idle' && (
          <button
            onClick={runCheck}
            className="rounded-lg bg-ink-900 px-3.5 py-1.5 text-xs font-semibold text-paper-50 hover:opacity-90 transition-opacity"
          >
            Run AI check
          </button>
        )}
        {status === 'loading' && (
          <Loader2 size={16} className="animate-spin text-signal-slate" />
        )}
        {status === 'done' && (
          <button
            onClick={runCheck}
            className="text-xs text-signal-slate hover:text-ink-900"
          >
            Re-run
          </button>
        )}
      </div>

      {status === 'idle' && (
        <p className="mt-2 text-xs text-signal-slate">
          For <span className="font-medium text-ink-900">{company.name}</span> — checks your profile against tender requirements
        </p>
      )}

      {status === 'loading' && (
        <p className="mt-3 text-xs text-signal-slate">Analysing eligibility…</p>
      )}

      {status === 'error' && (
        <p className="mt-3 text-xs text-signal-rust">{error}</p>
      )}

      {status === 'done' && report && cfg && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Score + verdict */}
          <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${cfg.bg}`}>
            <div className="flex items-center gap-2">
              <cfg.icon size={16} className={cfg.color} strokeWidth={2} />
              <span className={`text-sm font-bold tracking-wide ${cfg.color}`}>{cfg.label}</span>
            </div>
            <div className="text-right">
              <p className={`font-mono text-2xl font-bold ${cfg.color}`}>{report.score}</p>
              <p className="text-xs text-signal-slate">/ 100</p>
            </div>
          </div>

          {/* Reasoning */}
          {report.reasoning && (
            <p className="text-xs leading-relaxed text-signal-slate">{report.reasoning}</p>
          )}

          {/* Matched criteria */}
          {report.matched?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-signal-green">
                ✓ Meets
              </p>
              <ul className="flex flex-col gap-1">
                {report.matched.map((m, i) => (
                  <li key={i} className="flex gap-2 text-xs text-ink-900">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-signal-green" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing criteria */}
          {report.missing_criteria?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-signal-rust">
                ✗ Gaps
              </p>
              <ul className="flex flex-col gap-1">
                {report.missing_criteria.map((m, i) => (
                  <li key={i} className="flex gap-2 text-xs text-ink-900">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-signal-rust" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing docs */}
          {report.missing_docs?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brass-600">
                ⚑ Documents to prepare
              </p>
              <ul className="flex flex-col gap-1">
                {report.missing_docs.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs text-ink-900">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
