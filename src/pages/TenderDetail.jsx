import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, CalendarClock, Banknote, ShieldCheck, Loader2,
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import AIDossier from '../components/AIDossier'
import EligibilityReport from '../components/EligibilityReport'
import { getTenderById } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { tenders as mockTenders } from '../lib/mockTenders'

export default function TenderDetail() {
  const { id } = useParams()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const decoded = decodeURIComponent(id)
    if (supabase) {
      getTenderById(decoded)
        .then(setTender)
        .catch(() => {
          // Fallback to mock
          const mock = mockTenders.find((t) => t.id === decoded)
          if (mock) setTender(normalise(mock))
        })
        .finally(() => setLoading(false))
    } else {
      const mock = mockTenders.find((t) => t.id === decoded)
      if (mock) setTender(normalise(mock))
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-signal-slate" />
        </div>
      </AppLayout>
    )
  }

  if (!tender) {
    return (
      <AppLayout>
        <p className="text-sm text-signal-slate">Tender not found.</p>
        <Link to="/" className="mt-2 inline-block text-sm font-medium text-ink-900 underline">
          Back to Tender Board
        </Link>
      </AppLayout>
    )
  }

  const eligibility = Array.isArray(tender.eligibility)
    ? tender.eligibility
    : JSON.parse(tender.eligibility || '[]')
  const documents = Array.isArray(tender.documents_required)
    ? tender.documents_required
    : tender.documents || JSON.parse(tender.documents_required || '[]')

  return (
    <AppLayout>
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm font-medium text-signal-slate hover:text-ink-900"
      >
        <ArrowLeft size={15} strokeWidth={1.8} />
        Tender Board
      </Link>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-signal-slate">{tender.id}</span>
          <StatusPill status={tender.status} />
        </div>
        <h1 className="font-display text-3xl font-medium text-ink-900">{tender.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-signal-slate">{tender.description}</p>
      </div>

      {/* Metadata grid */}
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Building2, label: 'Organisation', value: tender.organization },
          { icon: MapPin, label: 'Location', value: tender.location },
          { icon: Banknote, label: 'Estimated value', value: tender.estimated_value || tender.estimatedValue },
          { icon: CalendarClock, label: 'Closing date', value: tender.closing_at || tender.closing },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-ink-900/10 bg-white p-4">
            <Icon size={16} strokeWidth={1.8} className="text-brass-600" />
            <p className="mt-2 text-xs uppercase tracking-wide text-signal-slate">{label}</p>
            <p className="mt-0.5 font-mono text-sm font-medium text-ink-900">{value}</p>
          </div>
        ))}
      </div>

      {/* AI Dossier */}
      <div className="mt-6">
        <AIDossier tender={tender} />
      </div>

      {/* Eligibility + Documents */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Eligibility criteria */}
        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-medium text-ink-900">
            <ShieldCheck size={17} strokeWidth={1.8} className="text-brass-600" />
            Eligibility criteria
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-900">
            {eligibility.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Documents required */}
        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <h2 className="font-display text-lg font-medium text-ink-900">Documents required</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-900">
            {documents.map((doc) => (
              <li key={doc} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                {doc}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs text-signal-slate">
            EMD: {tender.emd}
          </p>
        </div>

        {/* AI Eligibility Report */}
        <EligibilityReport tender={tender} />
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-900/10 pt-6">
        {tender.status !== 'Closed' ? (
          <Link
            to={`/tenders/${encodeURIComponent(tender.id)}/apply`}
            className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-opacity hover:opacity-90"
          >
            Fill application form
          </Link>
        ) : (
          <span className="rounded-lg bg-ink-900/5 px-5 py-2.5 text-sm font-medium text-signal-slate">
            Applications closed
          </span>
        )}
        <span className="text-xs text-signal-slate">
          Published {tender.published_at || tender.published}
        </span>
      </div>
    </AppLayout>
  )
}

// Normalise mock tender shape to match DB column names
function normalise(mock) {
  return {
    ...mock,
    estimated_value: mock.estimatedValue,
    source_portal: mock.sourcePortal,
    published_at: mock.published,
    closing_at: mock.closing,
    documents_required: mock.documents,
    ai_dossier: null,
  }
}
