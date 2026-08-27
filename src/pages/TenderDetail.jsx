import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, CalendarClock, Banknote, ShieldCheck } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import { tenders } from '../lib/mockTenders'

export default function TenderDetail() {
  const { id } = useParams()
  const tender = tenders.find((t) => t.id === decodeURIComponent(id))

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

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Building2, label: 'Organisation', value: tender.organization },
          { icon: MapPin, label: 'Location', value: tender.location },
          { icon: Banknote, label: 'Estimated value', value: tender.estimatedValue },
          { icon: CalendarClock, label: 'Closing date', value: tender.closing },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-ink-900/10 bg-white p-4">
            <Icon size={16} strokeWidth={1.8} className="text-brass-600" />
            <p className="mt-2 text-xs uppercase tracking-wide text-signal-slate">{label}</p>
            <p className="mt-0.5 font-mono text-sm font-medium text-ink-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-medium text-ink-900">
            <ShieldCheck size={17} strokeWidth={1.8} className="text-brass-600" />
            Eligibility criteria
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-900">
            {tender.eligibility.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <h2 className="font-display text-lg font-medium text-ink-900">Documents required</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-900">
            {tender.documents.map((doc) => (
              <li key={doc} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                {doc}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs text-signal-slate">EMD: {tender.emd}</p>
        </div>
      </div>

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
        <span className="text-xs text-signal-slate">Published {tender.published}</span>
      </div>
    </AppLayout>
  )
}
