import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, UploadCloud, Loader2, Sparkles, Copy, Check,
  Download, FileText, RefreshCw, Eye, Edit3, ShieldAlert
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { getTenderById, upsertApplication, getApplicationForTender } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { tenders as mockTenders } from '../lib/mockTenders'
import { generateTechnicalProposal } from '../lib/gemini'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function ApplicationForm() {
  const { id } = useParams()
  const { user, company } = useAuth()
  const navigate = useNavigate()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    firmName: '', contactPerson: '', email: '', phone: '',
    gstNumber: '', experienceYears: '', quotedAmount: '', notes: '',
    technicalProposal: '',
  })
  const [checkedDocs, setCheckedDocs] = useState({})
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [proposalCopied, setProposalCopied] = useState(false)
  const [proposalViewMode, setProposalViewMode] = useState('preview') // 'preview' | 'edit'
  const [proposalError, setProposalError] = useState('')

  useEffect(() => {
    const decoded = decodeURIComponent(id)
    const loadTender = supabase
      ? getTenderById(decoded)
      : Promise.resolve(mockTenders.find((t) => t.id === decoded))

    loadTender
      .then(async (t) => {
        if (!t) return
        // Normalise mock shape
        const normalised = {
          ...t,
          estimated_value: t.estimated_value || t.estimatedValue,
          documents_required: Array.isArray(t.documents_required)
            ? t.documents_required
            : t.documents || JSON.parse(t.documents_required || '[]'),
        }
        setTender(normalised)

        // Pre-fill from company profile
        if (company) {
          setForm((f) => ({
            ...f,
            firmName: company.name || '',
            email: company.contact_email || user?.email || '',
            phone: company.contact_phone || '',
            gstNumber: company.gstin || '',
            experienceYears: String(company.years_experience || ''),
          }))
        } else {
          setForm((f) => ({ ...f, email: user?.email || '' }))
        }

        // Load existing draft if any
        if (supabase && user) {
          const existing = await getApplicationForTender(user.id, decoded).catch(() => null)
          if (existing?.form_data) {
            setForm((f) => ({ ...f, ...existing.form_data }))
            setCheckedDocs(existing.checked_docs || {})
          }
        }
      })
      .finally(() => setLoading(false))
  }, [id, company, user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleDoc(doc) {
    setCheckedDocs((d) => ({ ...d, [doc]: !d[doc] }))
  }

  async function handleGenerateProposal() {
    if (!tender) return
    setIsGeneratingProposal(true)
    setProposalError('')
    try {
      const generated = await generateTechnicalProposal(tender, company, form.notes)
      update('technicalProposal', generated)
      setProposalViewMode('preview')
    } catch (err) {
      setProposalError(err.message || 'Failed to generate technical proposal.')
    } finally {
      setIsGeneratingProposal(false)
    }
  }

  function handleCopyProposal() {
    if (!form.technicalProposal) return
    navigator.clipboard.writeText(form.technicalProposal)
    setProposalCopied(true)
    setTimeout(() => setProposalCopied(false), 2000)
  }

  function handleDownloadProposal() {
    if (!form.technicalProposal || !tender) return
    const filename = `${(tender.id || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_')}_Technical_Proposal.doc`
    const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Technical Proposal - ${tender.title}</title><style>body{font-family:Segoe UI,Calibri,Arial,sans-serif;line-height:1.6;padding:32px;color:#10233F;max-width:800px;margin:auto;}h1{font-size:20pt;color:#10233F;border-bottom:2px solid #C9972A;padding-bottom:6px;}h2{font-size:14pt;color:#182F52;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:20pt;}h3{font-size:11pt;color:#5C6B7A;}p{margin:8pt 0;}table{border-collapse:collapse;width:100%;margin:12pt 0;}th,td{border:1px solid #ccc;padding:8px 12px;text-align:left;font-size:10pt;}th{background:#F5F3EC;font-weight:bold;color:#10233F;}li{margin:4pt 0;}</style></head><body>`
    
    // Markdown to formatted HTML for Word export
    let htmlContent = form.technicalProposal
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

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (supabase && user) {
        await upsertApplication({
          company_id: user.id,
          tender_id: tender.id,
          status: 'submitted',
          form_data: form,
          checked_docs: checkedDocs,
          submitted_at: new Date().toISOString(),
        })
      } else {
        // Fallback: save to localStorage
        const existing = JSON.parse(localStorage.getItem('dossier_applications') || '[]')
        const record = {
          tenderId: tender.id,
          tenderTitle: tender.title,
          organization: tender.organization,
          submittedAt: new Date().toISOString(),
          form,
          checkedDocs,
        }
        localStorage.setItem('dossier_applications', JSON.stringify([...existing, record]))
      }
      setSubmitted(true)
    } catch (err) {
      alert('Error saving application: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

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
      </AppLayout>
    )
  }

  if (submitted) {
    return (
      <AppLayout>
        <div className="mx-auto mt-16 flex max-w-md flex-col items-center text-center">
          <CheckCircle2 size={40} strokeWidth={1.5} className="text-signal-green" />
          <h1 className="mt-4 font-display text-2xl font-medium text-ink-900">
            Application saved
          </h1>
          <p className="mt-2 text-sm text-signal-slate">
            Your application for{' '}
            <span className="font-medium text-ink-900">{tender.title}</span> has been saved
            {supabase ? ' to your account' : ' locally'}.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/applications"
              className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50"
            >
              View my applications
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-ink-900/15 px-5 py-2.5 text-sm font-medium text-ink-900"
            >
              Tender Board
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Link
        to={`/tenders/${encodeURIComponent(tender.id)}`}
        className="flex items-center gap-1.5 text-sm font-medium text-signal-slate hover:text-ink-900"
      >
        <ArrowLeft size={15} strokeWidth={1.8} />
        Back to dossier
      </Link>

      <div className="mt-4">
        <p className="font-mono text-xs text-signal-slate">{tender.id}</p>
        <h1 className="font-display text-2xl font-medium text-ink-900">Application form</h1>
        <p className="text-sm text-signal-slate">{tender.title}</p>
        {company && (
          <p className="mt-1 text-xs text-brass-600">
            Pre-filled from your company profile — review and adjust as needed
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Card 1: Bidder details */}
          <div className="flex flex-col gap-4 rounded-xl border border-ink-900/10 bg-white p-5">
            <h2 className="font-display text-base font-medium text-ink-900">Bidder details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Firm / Organisation name" required>
                <input required value={form.firmName} onChange={(e) => update('firmName', e.target.value)} className="input" />
              </Field>
              <Field label="Contact person" required>
                <input required value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} className="input" />
              </Field>
              <Field label="Email" required>
                <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
              </Field>
              <Field label="Phone" required>
                <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" />
              </Field>
              <Field label="GST number" required>
                <input required value={form.gstNumber} onChange={(e) => update('gstNumber', e.target.value)} className="input font-mono" />
              </Field>
              <Field label="Years of relevant experience" required>
                <input type="number" min="0" required value={form.experienceYears} onChange={(e) => update('experienceYears', e.target.value)} className="input" />
              </Field>
              <Field label={`Quoted amount (est. value ${tender.estimated_value || tender.estimatedValue})`} required>
                <input required placeholder="₹" value={form.quotedAmount} onChange={(e) => update('quotedAmount', e.target.value)} className="input font-mono" />
              </Field>
            </div>
            <Field label="Additional notes / Custom strategy for evaluation committee">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="input resize-none"
                placeholder="Any special equipment, consortium partners, or customized execution notes…"
              />
            </Field>
          </div>

          {/* Card 2: AI Technical Proposal */}
          <div className="flex flex-col gap-4 rounded-xl border border-brass-500/30 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass-500/15 text-brass-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-medium text-ink-900">
                      Technical Proposal & Bid Submission
                    </h2>
                    {form.technicalProposal && (
                      <span className="rounded-full bg-signal-green-bg px-2 py-0.5 text-xs font-semibold text-signal-green border border-signal-green/20">
                        Drafted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-signal-slate">
                    AI-generated methodology, execution milestones, quality benchmarks & formal compliance declaration.
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {!form.technicalProposal ? (
                  <button
                    type="button"
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 hover:bg-ink-800 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingProposal ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Generating proposal…
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-brass-400" />
                        Draft Technical Proposal with AI
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setProposalViewMode((m) => (m === 'preview' ? 'edit' : 'preview'))}
                      className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-ink-900/5 transition-colors"
                      title={proposalViewMode === 'preview' ? 'Edit raw text' : 'View formatted preview'}
                    >
                      {proposalViewMode === 'preview' ? (
                        <>
                          <Edit3 size={12} /> Edit
                        </>
                      ) : (
                        <>
                          <Eye size={12} /> Preview
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyProposal}
                      className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-ink-900/5 transition-colors"
                      title="Copy proposal to clipboard"
                    >
                      {proposalCopied ? (
                        <>
                          <Check size={12} className="text-signal-green" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadProposal}
                      className="flex items-center gap-1.5 rounded-lg border border-brass-500/40 bg-brass-500/10 px-3 py-1.5 text-xs font-medium text-brass-700 hover:bg-brass-500/20 transition-colors"
                      title="Download as Microsoft Word document (.doc)"
                    >
                      <Download size={12} /> Export Word (.doc)
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateProposal}
                      disabled={isGeneratingProposal}
                      className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-xs font-medium text-signal-slate hover:text-ink-900 transition-colors disabled:opacity-50"
                      title="Re-generate with AI"
                    >
                      <RefreshCw size={12} className={isGeneratingProposal ? 'animate-spin' : ''} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message if any */}
            {proposalError && (
              <div className="rounded-lg bg-signal-rust-bg p-3 text-xs text-signal-rust flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0" />
                {proposalError}
              </div>
            )}

            {/* Proposal Content */}
            {isGeneratingProposal && (
              <div className="rounded-lg border border-dashed border-brass-500/30 bg-paper-50 p-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-brass-600" />
                <p className="text-sm font-medium text-ink-900">
                  Synthesizing tender parameters and company capabilities...
                </p>
                <p className="text-xs text-signal-slate max-w-md">
                  Crafting work plans, milestone schedules, quality undertakings, and formal compliance statements.
                </p>
              </div>
            )}

            {!isGeneratingProposal && !form.technicalProposal && (
              <div className="rounded-lg border border-dashed border-ink-900/15 bg-paper-50 p-6 text-center flex flex-col items-center justify-center gap-2">
                <FileText size={28} strokeWidth={1.5} className="text-signal-slate" />
                <p className="text-sm font-medium text-ink-900">No proposal drafted yet</p>
                <p className="text-xs text-signal-slate max-w-lg">
                  Click <strong>&ldquo;Draft Technical Proposal with AI&rdquo;</strong> to auto-generate a comprehensive technical submission tailored to this tender&rsquo;s scope of work. You can review and edit before submitting.
                </p>
              </div>
            )}

            {!isGeneratingProposal && form.technicalProposal && (
              <div>
                {proposalViewMode === 'edit' ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs text-signal-slate">
                      <span>Markdown Editor Mode</span>
                      <span>{form.technicalProposal.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                    <textarea
                      rows={14}
                      value={form.technicalProposal}
                      onChange={(e) => update('technicalProposal', e.target.value)}
                      className="input w-full font-mono text-xs leading-relaxed resize-y bg-paper-50"
                      placeholder="Write or edit technical proposal..."
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-ink-900/10 bg-white p-5 max-h-[520px] overflow-y-auto">
                    <MarkdownRenderer content={form.technicalProposal} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-900/10 bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-medium text-ink-900">
              <UploadCloud size={16} strokeWidth={1.8} className="text-brass-600" />
              Document checklist
            </h2>
            <p className="mt-1 text-xs text-signal-slate">
              Confirm you have these ready before submitting.
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {tender.documents_required.map((doc) => (
                <li key={doc}>
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-900">
                    <input
                      type="checkbox"
                      checked={!!checkedDocs[doc]}
                      onChange={() => toggleDoc(doc)}
                      className="mt-0.5 h-4 w-4 accent-ink-900"
                    />
                    {doc}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-ink-900 py-3 text-sm font-semibold text-paper-50 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Submit application'}
          </button>
        </div>
      </form>
    </AppLayout>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-signal-slate">
        {label}
        {required && <span className="text-signal-rust"> *</span>}
      </span>
      {children}
    </label>
  )
}


