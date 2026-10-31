import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileStack, Loader2, ArrowUpRight, FileText, Download, Copy, Check, X, Printer, FileDown } from 'lucide-react'
import BidDossierModal from '../components/BidDossierModal'
import { downloadOfficialNIT } from '../lib/dossierExporter'
import AppLayout from '../components/AppLayout'
import { StatusPill } from '../components/Seal'
import { useAuth } from '../context/AuthContext'
import { getMyApplications } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import MarkdownRenderer from '../components/MarkdownRenderer'

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
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [selectedDossierApp, setSelectedDossierApp] = useState(null)

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
            const technicalProposal = a.form_data?.technicalProposal || a.form?.technicalProposal
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
                    {technicalProposal && (
                      <span className="flex items-center gap-1 rounded-full border border-brass-500/30 bg-brass-500/10 px-2 py-0.5 text-xs font-medium text-brass-700">
                        <FileText size={11} />
                        Proposal attached
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
                <div className="flex shrink-0 items-center gap-2">
                  {technicalProposal && (
                    <button
                      onClick={() => setSelectedProposal({ title, tenderId, text: technicalProposal })}
                      className="flex items-center gap-1.5 rounded-lg border border-brass-500/40 bg-brass-500/10 px-3 py-2 text-xs font-semibold text-brass-700 hover:bg-brass-500/20 transition-colors"
                    >
                      <FileText size={13} /> View Proposal
                    </button>
                  )}
                  <Link
                    to={`/tenders/${encodeURIComponent(tenderId)}`}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-3.5 py-2 text-xs font-medium text-ink-900 hover:border-brass-500/40 hover:text-brass-600 transition-colors"
                  >
                    View tender <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Technical Proposal View Modal */}
      {selectedProposal && (
        <ProposalModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </AppLayout>
  )
}

function ProposalModal({ proposal, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(proposal.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const filename = `${(proposal.tenderId || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_')}_Technical_Proposal.doc`
    const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Technical Proposal</title><style>body{font-family:Segoe UI,Calibri,Arial,sans-serif;line-height:1.6;padding:32px;color:#10233F;max-width:800px;margin:auto;}h1{font-size:20pt;color:#10233F;border-bottom:2px solid #C9972A;padding-bottom:6px;}h2{font-size:14pt;color:#182F52;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:20pt;}table{border-collapse:collapse;width:100%;margin:12pt 0;}th,td{border:1px solid #ccc;padding:8px 12px;text-align:left;font-size:10pt;}th{background:#F5F3EC;font-weight:bold;color:#10233F;}li{margin:4pt 0;}</style></head><body>`
    
    let htmlContent = proposal.text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '<p></p>')

    const blob = new Blob([header + htmlContent + '</body></html>'], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-ink-900/10 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink-900/10 px-6 py-4">
          <div>
            <span className="font-mono text-xs text-signal-slate">{proposal.tenderId}</span>
            <h2 className="font-display text-lg font-semibold text-ink-900">{proposal.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-ink-900/5 transition-colors"
            >
              {copied ? <><Check size={13} className="text-signal-green" /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-brass-500/40 bg-brass-500/10 px-3 py-1.5 text-xs font-medium text-brass-700 hover:bg-brass-500/20 transition-colors"
            >
              <Download size={13} /> Export Word (.doc)
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-signal-slate hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-ink-900 bg-paper-50/50">
          <div className="rounded-xl border border-ink-900/10 bg-white p-6 shadow-xs">
            <MarkdownRenderer content={proposal.text} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-ink-900/10 px-6 py-3 text-xs text-signal-slate">
          <span>TenderAI Automated Technical Bid Response</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-ink-900 px-4 py-1.5 font-semibold text-paper-50 hover:bg-ink-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

