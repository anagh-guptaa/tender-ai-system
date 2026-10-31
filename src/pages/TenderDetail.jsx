import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, CalendarClock, Banknote, ShieldCheck, Loader2, Sparkles, MessageSquare, FileDown
} from 'lucide-react'
import { downloadOfficialNIT } from '../lib/dossierExporter'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import AIDossier from '../components/AIDossier'
import EligibilityReport from '../components/EligibilityReport'
import TenderQADrawer from '../components/TenderQADrawer'
import { getTenderById } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { tenders as mockTenders } from '../lib/mockTenders'

export default function TenderDetail() {
  const { id } = useParams()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isQaOpen, setIsQaOpen] = useState(false)

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
      {/* Top Navigation & Fast Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-signal-slate hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          Tender Board
        </Link>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadOfficialNIT(tender)}
            className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-paper-100 hover:border-brass-500/40 transition-all shadow-xs"
            title="Download or print official Government NIT specifications document"
          >
            <FileDown size={13} className="text-brass-600" />
            Official NIT Document
          </button>
          <button
            type="button"
            onClick={() => setIsQaOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-brass-500/30 bg-brass-500/10 px-3 py-1.5 text-xs font-semibold text-brass-800 hover:bg-brass-500/20 transition-all shadow-xs"
          >
            <Sparkles size={13} className="text-brass-600" />
            Ask TenderAI
          </button>
        </div>
      </div>

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

      {/* CTA Footer Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/10 pt-6">
        <div className="flex flex-wrap items-center gap-3">
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

          {/* Official NIT Document */}
          <button
            type="button"
            onClick={() => downloadOfficialNIT(tender)}
            className="flex items-center gap-2 rounded-lg border border-ink-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-paper-100 transition-all shadow-xs"
            title="Download or print official Government NIT specifications document"
          >
            <FileDown size={15} className="text-brass-600" />
            Official NIT Document
          </button>

          {/* Ask TenderAI CTA Button */}
          <button
            type="button"
            onClick={() => setIsQaOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-ink-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-paper-100 hover:border-brass-500/50 transition-all shadow-xs"
          >
            <Sparkles size={15} className="text-brass-600" />
            Ask TenderAI (Q&A)
          </button>
        </div>

        <span className="text-xs text-signal-slate">
          Published {tender.published_at || tender.published}
        </span>
      </div>

      {/* Floating Action Badge (Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsQaOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 rounded-full bg-ink-950 px-4 py-3 text-xs font-semibold text-paper-50 shadow-2xl border border-brass-500/40 hover:bg-ink-900 hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brass-500/20 text-brass-400 group-hover:bg-brass-500/30 transition-colors">
          <Sparkles size={13} />
        </div>
        <span>Ask TenderAI</span>
        <span className="flex h-2 w-2 rounded-full bg-signal-green animate-pulse" />
      </button>

      {/* Interactive Tender Q&A Drawer */}
      <TenderQADrawer
        isOpen={isQaOpen}
        onClose={() => setIsQaOpen(false)}
        tender={tender}
      />
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
