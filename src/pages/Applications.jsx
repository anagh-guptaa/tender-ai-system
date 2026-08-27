import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileStack } from 'lucide-react'
import AppLayout from '../components/AppLayout'

const APPLICATIONS_KEY = 'dossier_applications'

export default function Applications() {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    setApplications(JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]'))
  }, [])

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-medium text-ink-900">My Applications</h1>
      <p className="mt-1 text-sm text-signal-slate">
        Drafts you've filled and saved locally. Connect Supabase to persist and submit these.
      </p>

      {applications.length === 0 ? (
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
          {applications.map((a, i) => (
            <div key={i} className="rounded-xl border border-ink-900/10 bg-white p-5">
              <p className="font-mono text-xs text-signal-slate">{a.tenderId}</p>
              <h3 className="mt-1 font-display text-lg font-medium text-ink-900">
                {a.tenderTitle}
              </h3>
              <p className="text-sm text-signal-slate">{a.organization}</p>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink-900 sm:grid-cols-4">
                <span>
                  <span className="text-signal-slate">Firm: </span>
                  {a.form.firmName || '—'}
                </span>
                <span>
                  <span className="text-signal-slate">Quoted: </span>
                  {a.form.quotedAmount || '—'}
                </span>
                <span className="col-span-2 font-mono text-xs text-signal-slate sm:col-span-2">
                  Saved {new Date(a.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
