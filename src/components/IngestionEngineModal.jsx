import { useState } from 'react'
import { X, RefreshCw, CheckCircle2, Globe, Database, Sparkles, Cpu, Clock, AlertCircle } from 'lucide-react'
import { getIngestionState, runPortalIngestion } from '../lib/portalIngestion'

export default function IngestionEngineModal({ isOpen, onClose, onIngestionComplete }) {
  const [state, setState] = useState(getIngestionState)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)

  if (!isOpen) return null

  const handleStartIngestion = async () => {
    setIsRunning(true)
    setResult(null)
    try {
      const res = await runPortalIngestion((p) => {
        setProgress(p)
      })
      setResult(res)
      setState(getIngestionState())
      if (onIngestionComplete) {
        onIngestionComplete(res.tenders)
      }
    } catch (err) {
      console.error('Ingestion failed:', err)
    } finally {
      setIsRunning(false)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'Never'
    try {
      return new Date(isoString).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-paper-50 p-6 sm:p-8 shadow-2xl border border-paper-200 text-ink-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-paper-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-500/10 text-brass-700 border border-brass-500/20">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Automated Portal Ingestion Engine
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeds
                </span>
              </div>
              <p className="text-xs text-signal-slate">
                Daily scheduled crawler pulling procurement notices from Indian public portals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="rounded-lg p-1.5 text-signal-slate hover:bg-paper-100 transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portals Status Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {state.portals.map((portal) => (
            <div
              key={portal.name}
              className="rounded-xl border border-paper-200 bg-paper-100/60 p-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brass-600 font-bold">
                  FEED SOURCE
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="font-semibold text-xs text-ink-900 mt-1 line-clamp-1">{portal.name}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-signal-slate">
                <span>Indexed:</span>
                <span className="font-mono font-semibold text-ink-800">+{portal.noticesFound} / day</span>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule & Metadata Pill */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-900/5 p-3 text-xs text-ink-800 border border-ink-900/10">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-brass-600 shrink-0" />
            <span>
              <strong>Schedule:</strong> Daily at 06:00 AM IST (Cloud Cron)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={15} className="text-brass-600 shrink-0" />
            <span>
              <strong>Last Synced:</strong> {formatTime(state.lastCrawledAt)}
            </span>
          </div>
        </div>

        {/* Progress Display */}
        {isRunning && progress && (
          <div className="mt-5 rounded-xl border border-brass-500/20 bg-brass-500/5 p-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-brass-800">
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-brass-600" />
                Step {progress.step} of {progress.total}
              </span>
              <span className="font-mono">{Math.round((progress.step / progress.total) * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brass-200">
              <div
                className="h-full bg-brass-600 transition-all duration-300 ease-out"
                style={{ width: `${(progress.step / progress.total) * 100}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-xs text-ink-700">{progress.message}</p>
          </div>
        )}

        {/* Ingestion Results Notification */}
        {result && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-emerald-900">
                  Ingestion Cycle Successfully Executed
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Crawled <strong>{result.count} new government tenders</strong>. Gemini AI parsed the
                  scope, extracted EMD & eligibility, and indexed 3072-dimensional vector embeddings
                  for instant semantic search.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-paper-200 pt-4">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-paper-100 transition-colors disabled:opacity-40"
          >
            Close
          </button>
          <button
            onClick={handleStartIngestion}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-xs font-semibold text-paper-50 hover:bg-ink-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw size={14} className="animate-spin text-brass-400" />
                Ingesting Feeds...
              </>
            ) : (
              <>
                <RefreshCw size={14} className="text-brass-400" />
                Run Portal Ingestion Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
