import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles, Building2, MapPin, ArrowUpRight, Award, ShieldCheck, Loader2 } from 'lucide-react'
import { matchContractorProfile } from '../lib/vectorSearch'
import { useAuth } from '../context/AuthContext'

export default function ProfileMatchModal({ isOpen, onClose, tenders }) {
  const { company } = useAuth()
  const [loading, setLoading] = useState(false)
  const [matchedResults, setMatchedResults] = useState([])

  const defaultProfile = {
    name: company?.name || 'Registered Contractor',
    annual_turnover_lakhs: company?.annual_turnover_lakhs || 120,
    years_experience: company?.years_experience || 5,
    sectors: company?.sectors?.length ? company.sectors : ['Infrastructure & Energy', 'Civil & Roadworks'],
    certifications: company?.certifications?.length ? company.certifications : ['ISO 9001', 'Class-I MSME'],
  }

  const [activeProfile, setActiveProfile] = useState(defaultProfile)

  useEffect(() => {
    if (isOpen && tenders.length > 0) {
      runMatching(activeProfile)
    }
  }, [isOpen, tenders])

  const runMatching = async (profile) => {
    setLoading(true)
    try {
      const matches = await matchContractorProfile(profile, tenders)
      setMatchedResults(matches)
    } catch (err) {
      console.error('Vector profile matching failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-paper-50 p-6 sm:p-8 shadow-2xl border border-paper-200 text-ink-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-paper-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-500/10 text-brass-700 border border-brass-500/20">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  AI Semantic Profile Matchmaker (RAG)
                </h2>
                <span className="rounded-full bg-brass-100 px-2 py-0.5 text-[11px] font-semibold text-brass-800">
                  Vector RAG
                </span>
              </div>
              <p className="text-xs text-signal-slate">
                Vectorizing your company credentials and ranking active tenders via cosine semantic distance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-signal-slate hover:bg-paper-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Badges Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-paper-100 p-3 text-xs text-ink-800 border border-paper-200">
          <span className="font-semibold text-ink-900 flex items-center gap-1.5">
            <Building2 size={14} className="text-brass-600" />
            {activeProfile.name}
          </span>
          <span className="text-paper-300">|</span>
          <span className="font-mono text-signal-slate">
            Turnover: <strong>₹{activeProfile.annual_turnover_lakhs} Lakhs</strong>
          </span>
          <span className="text-paper-300">|</span>
          <span className="font-mono text-signal-slate">
            Exp: <strong>{activeProfile.years_experience} yrs</strong>
          </span>
          <span className="text-paper-300">|</span>
          <div className="flex items-center gap-1">
            {activeProfile.sectors.slice(0, 2).map((s) => (
              <span key={s} className="rounded-md bg-paper-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-800">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Matched Tenders List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={32} className="animate-spin text-brass-600" />
              <p className="mt-3 text-sm font-medium text-ink-800">
                Computing 3072-dimensional vector similarities...
              </p>
              <p className="text-xs text-signal-slate">
                Matching tender eligibility against your certifications and financial profile.
              </p>
            </div>
          ) : matchedResults.length === 0 ? (
            <div className="rounded-xl border border-paper-200 p-8 text-center">
              <p className="text-sm font-medium text-ink-700">No strong semantic matches found.</p>
              <p className="text-xs text-signal-slate mt-1">
                Try running the automated portal ingestion to pull today's latest public notices.
              </p>
            </div>
          ) : (
            matchedResults.map(({ tender, matchScore }, idx) => (
              <div
                key={tender.id}
                className="group relative rounded-xl border border-paper-200 bg-white p-4 transition-all hover:border-brass-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-ink-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-brass-400">
                        {matchScore}% Match
                      </span>
                      <span className="text-[11px] font-medium text-signal-slate">
                        #{idx + 1} Best Fit
                      </span>
                      <span className="font-mono text-[11px] text-paper-400">
                        {tender.id}
                      </span>
                    </div>

                    <h4 className="mt-1 font-display text-base font-semibold text-ink-900 group-hover:text-brass-700 transition-colors">
                      {tender.title}
                    </h4>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-signal-slate">
                      <span className="flex items-center gap-1">
                        <Building2 size={13} className="text-brass-600" />
                        {tender.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-brass-600" />
                        {tender.location}
                      </span>
                      <span className="font-mono font-semibold text-ink-900">
                        {tender.estimated_value}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-ink-600 line-clamp-2">
                      {tender.description}
                    </p>
                  </div>

                  <Link
                    to={`/tenders/${encodeURIComponent(tender.id)}`}
                    onClick={onClose}
                    className="flex shrink-0 items-center gap-1 rounded-xl bg-ink-900 px-3.5 py-2 text-xs font-semibold text-paper-50 hover:bg-ink-800 transition-colors"
                  >
                    Open Dossier
                    <ArrowUpRight size={14} className="text-brass-400" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-paper-200 pt-3 flex items-center justify-between text-xs text-signal-slate">
          <span>Powered by Google Gemini Embeddings (3072-dim Cosine Distance)</span>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-paper-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
