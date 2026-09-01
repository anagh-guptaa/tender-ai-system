import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileStack, Loader2, ArrowUpRight } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import { useAuth } from '../context/AuthContext'
import { getMyApplications } from '../lib/api'
import { supabase } from '../lib/supabaseClient'

const STATUS_STYLES = {
  draft: 'bg-paper-100 text-signal-slate border-ink-900/10',
  submitted: 'bg-signal-green-bg text-signal-green border-signal-green/20',
  won: 'bg-brass-500/10 text-brass-600 border-brass-500/20',
  lost: 'bg-signal-rust-bg text-signal-rust border-signal-rust/20',
}

export default function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabase && user) {
      getMyApplications(user.id)
        .then(setApplications)
        .catch(() => {
          // Fallback to localStorage
          const local = JSON.parse(localStorage.getItem('dossier_applications') || '[]')
          setApplications(local)
        })
        .finally(() => setLoading(false))
    } else {
      const local = JSON.parse(localStorage.getItem('dossier_applications') || '[]')
      setApplications(local)
      setLoading(false)
    }
  }, [user])

  return (
    <AppLayout>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-medium text-ink-900">My Applications</h1>
        <p className="text-sm text-signal-slate">
          Track and manage all the tenders you have applied to.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-signal-slate" />
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-ink-900/15 py-16 text-center">
          <FileStack size={28} strokeWidth={1.5} className="text-signal-slate" />
          <p className="mt-3 text-sm text-signal-slate">
            No applications yet. Open a tender from the board and fill its form.
          </p>
          <Link
            to="/"
            className="mt-4 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50"
          >
            Browse tenders
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {applications.map((a, i) => {
            // Support both Supabase shape (with joined tenders) and localStorage shape
            const title = a.tenders?.title || a.tenderTitle
            const org = a.tenders?.organization || a.organization
            const value = a.tenders?.estimated_value
            const closing = a.tenders?.closing_at
            const tenderId = a.tender_id || a.tenderId
            const firmName = a.form_data?.firmName || a.form?.firmName
            const quotedAmount = a.form_data?.quotedAmount || a.form?.quotedAmount
            const savedAt = a.created_at || a.submittedAt

            return (
              <div
                key={a.id || i}
                className="flex flex-col gap-3 rounded-xl border border-ink-900/10 bg-white p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-signal-slate">{tenderId}</span>
                    {a.status && (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          STATUS_STYLES[a.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {a.status}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-medium text-ink-900">{title}</h3>
                  <p className="text-sm text-signal-slate">{org}</p>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink-900 sm:grid-cols-4">
                    {firmName && (
                      <span>
                        <span className="text-signal-slate">Firm: </span>
                        {firmName}
                      </span>
                    )}
                    {quotedAmount && (
                      <span>
                        <span className="text-signal-slate">Quoted: </span>
                        {quotedAmount}
                      </span>
                    )}
                    {value && (
                      <span>
                        <span className="text-signal-slate">Est. value: </span>
                        {value}
                      </span>
                    )}
                    {closing && (
                      <span className="text-signal-slate">Closes {closing}</span>
                    )}
                    <span className="col-span-2 font-mono text-xs text-signal-slate sm:col-span-4">
                      Saved {new Date(savedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/tenders/${encodeURIComponent(tenderId)}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-900/15 px-3.5 py-2 text-xs font-medium text-ink-900 hover:border-brass-500/40 hover:text-brass-600 transition-colors"
                >
                  View tender <ArrowUpRight size={13} />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
