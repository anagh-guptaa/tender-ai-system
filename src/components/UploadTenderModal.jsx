import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles,
  X, Globe2, Lock, ArrowRight, RefreshCw, Plus, Trash2, Copy, Check,
  SlidersHorizontal, BookOpen
} from 'lucide-react'
import { extractTextFromFile } from '../lib/pdfExtractor'
import { parseTenderFromDocument } from '../lib/gemini'
import { createTender } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import MarkdownRenderer from './MarkdownRenderer'

const CATEGORIES = [
  'Infrastructure & Energy',
  'Medical & Healthcare',
  'IT & Hardware',
  'Civil Construction',
  'Transport & Logistics',
  'Services & Maintenance',
  'General Procurement',
]

export default function UploadTenderModal({ isOpen, onClose, onTenderCreated }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [isPublic, setIsPublic] = useState(true) // Option 1: Universal with Visibility Toggle
  const [step, setStep] = useState('select') // 'select' | 'extracting' | 'review'
  const [activeTab, setActiveTab] = useState('report') // 'report' | 'parameters'
  const [copied, setCopied] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Extracted tender fields
  const [tenderData, setTenderData] = useState(null)

  if (!isOpen) return null

  function resetState() {
    setFile(null)
    setStep('select')
    setActiveTab('report')
    setCopied(false)
    setStatusMessage('')
    setError('')
    setTenderData(null)
    setSaving(false)
  }

  function handleClose() {
    resetState()
    onClose()
  }

  function handleFileSelect(e) {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setError('')
    }
  }

  async function handleStartExtraction() {
    if (!file) return
    setError('')
    setStep('extracting')
    try {
      setStatusMessage('Reading PDF pages and extracting text...')
      const rawText = await extractTextFromFile(file)

      setStatusMessage('AI analyzing procurement parameters & generating Executive Report...')
      const parsed = await parseTenderFromDocument(rawText, file.name)

      setTenderData({
        ...parsed,
        is_public: isPublic,
        uploaded_by: user?.id || 'anonymous',
      })
      setActiveTab('report')
      setStep('review')
    } catch (err) {
      setError(err.message || 'Failed to extract text or analyze tender document.')
      setStep('select')
    }
  }

  function handleCopyReport() {
    const textToCopy = tenderData?.markdown_report || tenderData?.ai_dossier || ''
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function updateField(field, value) {
    setTenderData((prev) => ({ ...prev, [field]: value }))
  }

  function addArrayItem(field) {
    setTenderData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }))
  }

  function updateArrayItem(field, index, value) {
    setTenderData((prev) => {
      const arr = [...(prev[field] || [])]
      arr[index] = value
      return { ...prev, [field]: arr }
    })
  }

  function removeArrayItem(field, index) {
    setTenderData((prev) => {
      const arr = [...(prev[field] || [])]
      arr.splice(index, 1)
      return { ...prev, [field]: arr }
    })
  }

  async function handleSaveTender() {
    if (!tenderData) return
    setSaving(true)
    setError('')
    try {
      const cleanedTender = {
        ...tenderData,
        ai_dossier: tenderData.markdown_report || tenderData.ai_dossier || '',
        eligibility: (tenderData.eligibility || []).filter(Boolean),
        documents_required: (tenderData.documents_required || []).filter(Boolean),
        created_at: new Date().toISOString(),
      }

      const created = await createTender(cleanedTender)
      if (onTenderCreated) onTenderCreated(created)
      handleClose()
      navigate(`/tenders/${encodeURIComponent(created.id)}`)
    } catch (err) {
      setError(err.message || 'Failed to save tender to database.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/65 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-ink-900/10 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-900/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass-500/15 text-brass-700">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-ink-900">
                Ingest Tender Document (PDF)
              </h2>
              <p className="text-xs text-signal-slate">
                AI extraction engine for government NITs and private procurement notices
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-signal-slate hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-signal-rust/20 bg-signal-rust-bg p-3.5 text-xs text-signal-rust">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* STEP 1: SELECT FILE & OPTIONS */}
          {step === 'select' && (
            <div className="flex flex-col gap-5">
              {/* Drag and drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  file
                    ? 'border-brass-500 bg-brass-500/5'
                    : 'border-ink-900/15 bg-paper-50/60 hover:border-brass-500/50 hover:bg-paper-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-100 text-brass-600 mb-3 shadow-xs">
                  {file ? <FileText size={24} /> : <UploadCloud size={24} />}
                </div>
                {file ? (
                  <>
                    <p className="text-sm font-semibold text-ink-900 truncate max-w-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-signal-slate mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Click to choose different file
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink-900">
                      Drop tender PDF here, or <span className="text-brass-700 underline">browse</span>
                    </p>
                    <p className="text-xs text-signal-slate mt-1">
                      Supports GeM Bids, CPPP NITs, State eProcurement notices (PDF, TXT)
                    </p>
                  </>
                )}
              </div>

              {/* Visibility Toggle (Option 1) */}
              <div className="flex flex-col gap-2 rounded-xl border border-ink-900/10 bg-paper-50/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-signal-slate">
                  Tender Visibility Mode
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <label
                    onClick={() => setIsPublic(true)}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      isPublic
                        ? 'border-brass-500 bg-white shadow-xs'
                        : 'border-ink-900/10 bg-transparent hover:bg-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="mt-1 accent-ink-900"
                    />
                    <div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-950">
                        <Globe2 size={13} className="text-signal-green" />
                        Public Board Listing
                      </span>
                      <p className="text-[11px] text-signal-slate mt-0.5 leading-snug">
                        Adds this tender to the shared public register for all bidders to discover.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setIsPublic(false)}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      !isPublic
                        ? 'border-brass-500 bg-white shadow-xs'
                        : 'border-ink-900/10 bg-transparent hover:bg-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="mt-1 accent-ink-900"
                    />
                    <div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-950">
                        <Lock size={13} className="text-brass-600" />
                        Private Analysis Only
                      </span>
                      <p className="text-[11px] text-signal-slate mt-0.5 leading-snug">
                        Keep strictly private for my company to run eligibility and draft proposals.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleStartExtraction}
                disabled={!file}
                className="flex items-center justify-center gap-2 rounded-xl bg-ink-900 py-3 text-sm font-semibold text-paper-50 transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Sparkles size={16} className="text-brass-400" />
                Extract & Analyze with AI
              </button>
            </div>
          )}

          {/* STEP 2: EXTRACTING PROGRESS */}
          {step === 'extracting' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brass-500/10 text-brass-700">
                <Loader2 size={32} className="animate-spin text-brass-600" />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold text-ink-900">
                Processing Tender Document
              </h3>
              <p className="mt-1.5 text-xs text-signal-slate max-w-sm">
                {statusMessage}
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-signal-slate">
                <span className="h-1.5 w-1.5 rounded-full bg-brass-500 animate-ping" />
                Parsing scope of work, budget, EMD and criteria...
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT PARSED PARAMETERS */}
          {step === 'review' && tenderData && (
            <div className="flex flex-col gap-4">
              {/* Tab Navigation & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900/10 pb-3">
                <div className="flex items-center gap-1 rounded-lg bg-ink-900/5 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeTab === 'report'
                        ? 'bg-white text-ink-950 shadow-xs'
                        : 'text-signal-slate hover:text-ink-900'
                    }`}
                  >
                    <BookOpen size={13} className={activeTab === 'report' ? 'text-brass-600' : ''} />
                    Executive Report (Markdown)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('parameters')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeTab === 'parameters'
                        ? 'bg-white text-ink-950 shadow-xs'
                        : 'text-signal-slate hover:text-ink-900'
                    }`}
                  >
                    <SlidersHorizontal size={13} className={activeTab === 'parameters' ? 'text-brass-600' : ''} />
                    Extracted Parameters
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'report' && (
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-900 hover:bg-paper-50 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-signal-green" />
                          <span className="text-signal-green">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-signal-slate hover:text-ink-900 hover:bg-ink-900/5 transition-colors"
                  >
                    <RefreshCw size={11} /> Re-upload
                  </button>
                </div>
              </div>

              {/* TAB 1: EXECUTIVE MARKDOWN REPORT */}
              {activeTab === 'report' && (
                <div className="flex flex-col gap-4">
                  {/* Snapshot Metric Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-brass-500/25 bg-brass-500/5 p-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-signal-slate">Procuring Entity</p>
                      <p className="font-semibold text-ink-900 truncate" title={tenderData.organization}>
                        {tenderData.organization || 'Public Authority'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-signal-slate">Estimated Budget</p>
                      <p className="font-mono font-semibold text-ink-900">
                        {tenderData.estimated_value || '₹1.50 Cr'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-signal-slate">EMD / Security</p>
                      <p className="font-mono font-semibold text-ink-900 truncate">
                        {tenderData.emd || 'Exempted'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-signal-slate">Submission Due</p>
                      <p className="font-mono font-semibold text-ink-900">
                        {tenderData.closing_at || 'TBD'}
                      </p>
                    </div>
                  </div>

                  {/* Rendered Markdown Report */}
                  <div className="rounded-xl border border-ink-900/10 bg-white p-5 shadow-xs">
                    <MarkdownRenderer content={tenderData.markdown_report || tenderData.ai_dossier} />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-paper-100/70 px-3.5 py-2 text-xs text-signal-slate">
                    <span>💡 Pure English Executive Report generated. Want to modify title or dates?</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('parameters')}
                      className="font-semibold text-ink-900 underline hover:text-brass-700 ml-2 shrink-0"
                    >
                      Edit Parameters →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PARAMETERS & FIELDS */}
              {activeTab === 'parameters' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Tender Reference / ID
                      </label>
                      <input
                        value={tenderData.id || ''}
                        onChange={(e) => updateField('id', e.target.value)}
                        className="input font-mono text-xs"
                        placeholder="e.g. GEM/2026/B/9481203"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Project Title
                      </label>
                      <input
                        value={tenderData.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="input text-xs font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Procuring Authority
                      </label>
                      <input
                        value={tenderData.organization || ''}
                        onChange={(e) => updateField('organization', e.target.value)}
                        className="input text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Category
                      </label>
                      <select
                        value={tenderData.category || CATEGORIES[0]}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="input text-xs"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Execution Location
                      </label>
                      <input
                        value={tenderData.location || ''}
                        onChange={(e) => updateField('location', e.target.value)}
                        className="input text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Estimated Project Value
                      </label>
                      <input
                        value={tenderData.estimated_value || ''}
                        onChange={(e) => updateField('estimated_value', e.target.value)}
                        className="input font-mono text-xs"
                        placeholder="₹1.85 Cr"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        EMD Amount
                      </label>
                      <input
                        value={tenderData.emd || ''}
                        onChange={(e) => updateField('emd', e.target.value)}
                        className="input font-mono text-xs"
                        placeholder="₹92,500 / Exemption"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Closing Date
                      </label>
                      <input
                        type="date"
                        value={tenderData.closing_at || ''}
                        onChange={(e) => updateField('closing_at', e.target.value)}
                        className="input text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Scope of Work Summary
                      </label>
                      <textarea
                        rows={2}
                        value={tenderData.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="input text-xs leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  {/* Eligibility Requirements */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-ink-900/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Eligibility Criteria ({tenderData.eligibility?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('eligibility')}
                        className="flex items-center gap-1 text-xs font-medium text-brass-700 hover:opacity-80"
                      >
                        <Plus size={12} /> Add criteria
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {(tenderData.eligibility || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            value={item}
                            onChange={(e) => updateArrayItem('eligibility', idx, e.target.value)}
                            className="input text-xs py-1 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('eligibility', idx)}
                            className="p-1.5 text-signal-slate hover:text-signal-rust"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-ink-900/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate">
                        Documents Required ({tenderData.documents_required?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => addArrayItem('documents_required')}
                        className="flex items-center gap-1 text-xs font-medium text-brass-700 hover:opacity-80"
                      >
                        <Plus size={12} /> Add document
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {(tenderData.documents_required || []).map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            value={doc}
                            onChange={(e) => updateArrayItem('documents_required', idx, e.target.value)}
                            className="input text-xs py-1 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('documents_required', idx)}
                            className="p-1.5 text-signal-slate hover:text-signal-rust"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-ink-900/10 px-6 py-4 bg-paper-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-ink-900/15 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-white transition-colors"
          >
            Cancel
          </button>

          {step === 'review' && (
            <button
              type="button"
              onClick={handleSaveTender}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-xs font-semibold text-paper-50 hover:bg-ink-800 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  Publish to {isPublic ? 'Tender Board' : 'My Tenders'}
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
