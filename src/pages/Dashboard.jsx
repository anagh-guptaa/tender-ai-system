import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Building2,
  ArrowUpRight,
  Loader2,
  Sparkles,
  UploadCloud,
  Cpu,
  Target,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import { getTenders, getTenderCategories } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { tenders as mockTenders, categories as mockCategories, statuses } from '../lib/mockTenders'
import UploadTenderModal from '../components/UploadTenderModal'
import IngestionEngineModal from '../components/IngestionEngineModal'
import ProfileMatchModal from '../components/ProfileMatchModal'
import { searchTendersSemantic } from '../lib/vectorSearch'
import { getIngestionState } from '../lib/portalIngestion'

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [tenders, setTenders] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Semantic Vector Search (RAG) State
  const [isSemanticSearch, setIsSemanticSearch] = useState(false)
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false)
  const [semanticTenders, setSemanticTenders] = useState([])

  const ingestionState = getIngestionState()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    if (supabase) {
      Promise.all([getTenders(), getTenderCategories()])
        .then(([t, c]) => {
          setTenders(t)
          setCategories(c)
        })
        .catch(() => {
          setTenders(mockTenders)
          setCategories(mockCategories)
        })
        .finally(() => setLoading(false))
    } else {
      setTenders(mockTenders)
      setCategories(mockCategories)
      setLoading(false)
    }
  }

  // Handle live semantic vector search debounced
  useEffect(() => {
    if (!isSemanticSearch || !query.trim()) {
      setSemanticTenders([])
      return
    }

    let active = true
    setIsSearchingSemantic(true)

    const timer = setTimeout(async () => {
      try {
        const results = await searchTendersSemantic(query, tenders)
        if (active) {
          setSemanticTenders(results)
        }
      } catch (err) {
        console.error('Semantic search error:', err)
      } finally {
        if (active) setIsSearchingSemantic(false)
      }
    }, 350)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, isSemanticSearch, tenders])

  const filtered = useMemo(() => {
    if (isSemanticSearch && query.trim()) {
      return semanticTenders
    }

    return tenders.filter((t) => {
      const matchesQuery =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.organization.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' || t.category === category
      const matchesStatus = status === 'All' || t.status === status
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [tenders, query, category, status, isSemanticSearch, semanticTenders])

  return (
    <AppLayout>
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-brass-600 font-bold">
              Register • {tenders.length} listings indexed
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Daily Crawler 06:00 IST
            </span>
          </div>
          <h1 className="font-display text-3xl font-medium text-ink-900 mt-1">Tender Board</h1>
          <p className="max-w-2xl text-sm text-signal-slate">
            Aggregated from GeM, CPPP, and State Procurement Portals. Open a dossier to review
            eligibility and file your application without leaving the site.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Matchmaker Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-brass-600/30 bg-brass-500/10 px-3.5 py-2.5 text-xs font-semibold text-brass-800 hover:bg-brass-500/20 transition-all shadow-xs"
            title="Match active tenders against your registered company capabilities using Vector RAG"
          >
            <Target size={15} className="text-brass-700" />
            Match My Profile
          </button>

          {/* Ingestion Engine Trigger */}
          <button
            onClick={() => setIsIngestionModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-800 hover:bg-paper-100 transition-colors shadow-xs"
            title="View automated daily portal crawler status and trigger live sync"
          >
            <Cpu size={15} className="text-brass-600" />
            Ingestion Engine
          </button>

          {/* Upload PDF */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-semibold text-paper-50 hover:bg-ink-800 transition-colors shadow-xs"
          >
            <UploadCloud size={15} className="text-brass-400" />
            Upload PDF
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-signal-slate"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isSemanticSearch
                  ? "Describe in plain language (e.g. 'solar installation in Odisha under 2 Cr with MSE exemption')..."
                  : 'Search by title, organisation, or tender ID'
              }
              className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2 transition-all ${
                isSemanticSearch
                  ? 'border-brass-500/60 bg-brass-500/5 shadow-inner'
                  : 'border-ink-900/15 bg-white'
              }`}
            />
            {isSearchingSemantic && (
              <Loader2
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-brass-600"
              />
            )}
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSemanticSearch}
            className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2 disabled:opacity-40"
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSemanticSearch}
            className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2 disabled:opacity-40"
          >
            <option>All</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Search Mode Toggle Bar */}
        <div className="flex items-center justify-between text-xs text-signal-slate px-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink-800">Search Mode:</span>
            <button
              type="button"
              onClick={() => setIsSemanticSearch(false)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                !isSemanticSearch
                  ? 'bg-ink-900 text-paper-50'
                  : 'bg-paper-100 text-ink-700 hover:bg-paper-200'
              }`}
            >
              Keyword Exact
            </button>
            <button
              type="button"
              onClick={() => setIsSemanticSearch(true)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                isSemanticSearch
                  ? 'bg-brass-600 text-white shadow-xs'
                  : 'bg-paper-100 text-ink-700 hover:bg-paper-200'
              }`}
            >
              <Sparkles size={12} />
              AI Semantic RAG
            </button>
          </div>

          {isSemanticSearch && (
            <span className="font-mono text-[11px] text-brass-700">
              ⚡ Powered by 3072-dim Vector Embeddings
            </span>
          )}
        </div>
      </div>

      {/* Tender Listings */}
      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-signal-slate" />
          </div>
        ) : (
          <>
            {filtered.map((t) => (
              <Link
                key={t.id}
                to={`/tenders/${encodeURIComponent(t.id)}`}
                className="group flex flex-col gap-3 rounded-xl border border-ink-900/10 bg-white p-5 transition-colors hover:border-brass-500/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-signal-slate">{t.id}</span>
                    <StatusPill status={t.status} />

                    {/* Semantic Match Score Badge */}
                    {typeof t.similarityScore === 'number' && (
                      <span className="flex items-center gap-1 rounded-full bg-ink-900 px-2 py-0.5 text-xs font-mono font-bold text-brass-400">
                        <Sparkles size={10} />
                        {t.similarityScore}% Match
                      </span>
                    )}

                    {t.ai_dossier && !t.similarityScore && (
                      <span className="flex items-center gap-1 rounded-full border border-brass-500/30 bg-brass-500/10 px-2 py-0.5 text-xs font-medium text-brass-600">
                        <Sparkles size={10} />
                        AI analysed
                      </span>
                    )}

                    {t.source_portal && (
                      <span className="rounded-md bg-paper-100 px-2 py-0.5 text-[10px] font-medium text-signal-slate">
                        {t.source_portal}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1.5 font-display text-lg font-medium text-ink-900 group-hover:text-brass-600">
                    {t.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-signal-slate">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={14} strokeWidth={1.8} />
                      {t.organization}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} strokeWidth={1.8} />
                      {t.location}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-1.5">
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium text-ink-900">
                      {t.estimated_value || t.estimatedValue}
                    </p>
                    <p className="text-xs text-signal-slate">
                      Closes {t.closing_at || t.closing}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.8}
                    className="text-signal-slate transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brass-600"
                  />
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-sm text-signal-slate">
                {isSemanticSearch
                  ? 'No semantic matches found for this query. Try phrasing your query differently.'
                  : 'No tenders match those filters. Try widening the search or category.'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <UploadTenderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTenderCreated={(newTender) => {
          setTenders((prev) => [newTender, ...prev.filter((t) => t.id !== newTender.id)])
        }}
      />

      <IngestionEngineModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        onIngestionComplete={(newCrawled) => {
          setTenders((prev) => {
            const map = new Map()
            newCrawled.forEach((t) => map.set(t.id, t))
            prev.forEach((t) => {
              if (!map.has(t.id)) map.set(t.id, t)
            })
            return Array.from(map.values())
          })
        }}
      />

      <ProfileMatchModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        tenders={tenders}
      />
    </AppLayout>
  )
}
