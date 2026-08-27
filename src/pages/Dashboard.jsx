import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Building2, ArrowUpRight } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import { tenders, categories, statuses } from '../lib/mockTenders'

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  const filtered = useMemo(() => {
    return tenders.filter((t) => {
      const matchesQuery =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.organization.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' || t.category === category
      const matchesStatus = status === 'All' || t.status === status
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [query, category, status])

  return (
    <AppLayout>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-600">
          Register — {tenders.length} listings indexed
        </p>
        <h1 className="font-display text-3xl font-medium text-ink-900">Tender Board</h1>
        <p className="max-w-2xl text-sm text-signal-slate">
          Aggregated from government and public-institute tender pages. Open a dossier to review
          eligibility and file your application without leaving the site.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-signal-slate"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, organisation, or tender ID"
            className="w-full rounded-lg border border-ink-900/15 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2"
        >
          <option>All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2"
        >
          <option>All</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-col gap-3">
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
                <span>{t.sourcePortal}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-1.5">
              <div className="text-right">
                <p className="font-mono text-sm font-medium text-ink-900">{t.estimatedValue}</p>
                <p className="text-xs text-signal-slate">Closes {t.closing}</p>
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
            No tenders match those filters. Try widening the search or category.
          </div>
        )}
      </div>
    </AppLayout>
  )
}
