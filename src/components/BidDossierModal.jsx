import { useState } from 'react'
import { X, Printer, Download, Copy, Check, FileText, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import { exportBidDossierToWord } from '../lib/dossierExporter'

export default function BidDossierModal({ isOpen, onClose, tender, company, form, checkedDocs }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !tender) return null

  const firmName = form?.firmName || company?.name || 'Registered Contractor'
  const tenderOrg = tender?.organization || 'Procuring Authority'
  const tenderId = tender?.id || 'N/A'
  const quoted = form?.quotedAmount || tender?.estimated_value || 'As per BOQ'
  const proposalText = form?.technicalProposal || 'Technical proposal not yet compiled.'

  const checkedList = Object.entries(checkedDocs || {})
    .filter(([_, checked]) => checked)
    .map(([doc]) => doc)

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    const fullText = `
FORMAL BID SUBMISSION DOSSIER
Tender: ${tender.title} (Ref: ${tenderId})
Procuring Authority: ${tenderOrg}
Bidder Firm: ${firmName}
Quoted Amount: ${quoted}

1. TECHNICAL PROPOSAL & METHODOLOGY:
${proposalText}

2. VERIFIED DOCUMENTS:
${checkedList.map((d) => `[x] ${d}`).join('\n')}

3. STATUTORY UNDERTAKINGS:
- Non-Blacklisting certified
- Class-I Local Supplier (Make in India) certified
- Bid validity: 180 days

Authorized Signatory for ${firmName}
Date: ${new Date().toLocaleDateString('en-IN')}
`.trim()

    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-paper-50 p-6 sm:p-8 shadow-2xl border border-paper-200 text-ink-900 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-paper-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-500/15 text-brass-700">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Official Bid Submission Dossier
                </h2>
                <span className="rounded-full bg-signal-green-bg px-2 py-0.5 text-[11px] font-semibold text-signal-green border border-signal-green/20">
                  Ready for Submission
                </span>
              </div>
              <p className="text-xs text-signal-slate">
                Complied according to GeM / CPPP standard procurement guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-ink-900 px-3.5 py-2 text-xs font-semibold text-paper-50 hover:bg-ink-800 transition-colors shadow-xs"
              title="Save as PDF using browser print"
            >
              <Printer size={14} className="text-brass-400" />
              Print / Save as PDF
            </button>

            <button
              onClick={() => exportBidDossierToWord({ tender, company, form, checkedDocs })}
              className="flex items-center gap-1.5 rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-paper-100 transition-colors shadow-xs"
              title="Export as Microsoft Word document (.doc)"
            >
              <Download size={14} />
              Export Word
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-paper-100 transition-colors shadow-xs"
            >
              {copied ? <Check size={14} className="text-signal-green" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-signal-slate hover:bg-paper-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="print-dossier" className="mt-4 flex-1 overflow-y-auto pr-2 bg-white rounded-xl border border-paper-200 p-6 sm:p-10 text-ink-900 shadow-inner">
          {/* Company Letterhead */}
          <div className="text-center border-b-2 border-ink-900 pb-5 mb-6">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink-900">
              {firmName}
            </h1>
            <p className="font-mono text-xs text-signal-slate mt-1">
              GSTIN: <strong>{form?.gstNumber || company?.gstin || '21AAAAA0000A1Z5'}</strong> | PAN: <strong>{company?.pan || 'ABCDE1234F'}</strong> | MSME: <strong>{company?.registration_type || 'Class-I'}</strong>
            </p>
            <p className="text-xs text-signal-slate">
              Email: {form?.email || company?.contact_email || 'bids@company.in'} | Phone: {form?.phone || company?.contact_phone || '+91 98765 43210'}
            </p>
          </div>

          {/* Submission Notice Block */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 text-xs font-mono text-signal-slate border-b border-paper-200 pb-4 mb-5">
            <div>
              <p className="font-bold text-ink-900">TO:</p>
              <p className="text-ink-800 font-medium">{tenderOrg}</p>
              <p>{tender.location || 'India'}</p>
              <p>Official Portal: {tender.source_portal || 'GeM / CPPP'}</p>
            </div>
            <div className="sm:text-right">
              <p><strong>Ref NIT No:</strong> <span className="text-ink-900">{tenderId}</span></p>
              <p><strong>Submission Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
              <p><strong>Bid Validity:</strong> 180 Days</p>
            </div>
          </div>

          {/* Subject Line */}
          <div className="bg-paper-100/60 p-3 rounded-lg border border-paper-200 mb-6">
            <p className="text-xs font-semibold text-ink-900">
              <strong>SUB:</strong> Submission of Formal Technical & Commercial Bidding Dossier for <em>"{tender.title}"</em>.
            </p>
          </div>

          {/* Section 1: Executive Commercial Table */}
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brass-700 border-b border-brass-500/20 pb-1 mb-3">
            1. Executive Bid Summary
          </h3>
          <table className="w-full text-left text-xs border border-paper-200 mb-6">
            <tbody>
              <tr className="border-b border-paper-200 bg-paper-50">
                <th className="p-2.5 font-semibold text-signal-slate w-1/3">Procurement Title</th>
                <td className="p-2.5 text-ink-900 font-medium">{tender.title}</td>
              </tr>
              <tr className="border-b border-paper-200">
                <th className="p-2.5 font-semibold text-signal-slate">Estimated Tender Value</th>
                <td className="p-2.5 font-mono text-ink-900">{tender.estimated_value || tender.estimatedValue}</td>
              </tr>
              <tr className="border-b border-paper-200 bg-paper-50">
                <th className="p-2.5 font-semibold text-signal-slate">Quoted Commercial Bid</th>
                <td className="p-2.5 font-mono font-bold text-emerald-700 text-sm">{quoted}</td>
              </tr>
              <tr className="border-b border-paper-200">
                <th className="p-2.5 font-semibold text-signal-slate">Earnest Money Deposit (EMD)</th>
                <td className="p-2.5 font-mono text-ink-900">{tender.emd} (MSME Exemption Undertaking Attached)</td>
              </tr>
            </tbody>
          </table>

          {/* Section 2: Technical Proposal */}
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brass-700 border-b border-brass-500/20 pb-1 mb-3">
            2. Technical Proposal & Execution Methodology
          </h3>
          <div className="text-xs text-ink-900 leading-relaxed mb-6 space-y-3 bg-paper-50/50 p-4 rounded-xl border border-paper-200">
            <MarkdownRenderer content={proposalText} />
          </div>

          {/* Section 3: Document Compliance Matrix */}
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brass-700 border-b border-brass-500/20 pb-1 mb-3">
            3. Document Verification & Compliance Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-6">
            {checkedList.length > 0 ? (
              checkedList.map((doc) => (
                <div key={doc} className="flex items-center gap-2 rounded-lg bg-emerald-50/60 border border-emerald-200 p-2 text-emerald-900">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-medium">{doc}</span>
                </div>
              ))
            ) : (
              <p className="text-signal-slate italic">All mandatory documents verified as per NIT terms.</p>
            )}
          </div>

          {/* Section 4: Legal Undertakings */}
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brass-700 border-b border-brass-500/20 pb-1 mb-3">
            4. Statutory Undertakings & Declarations
          </h3>
          <div className="text-xs text-signal-slate space-y-2 mb-8 bg-paper-50 p-3 rounded-lg border border-paper-200">
            <p><strong>(a) Non-Blacklisting:</strong> We hereby declare that our firm has not been debarred or blacklisted by any Central/State Ministry, PSU, or Municipal Corporation.</p>
            <p><strong>(b) Make in India Compliance:</strong> We certify that the goods/services offered contain more than 50% local value addition satisfying Class-I Local Supplier guidelines.</p>
            <p><strong>(c) Acceptance of Penalties:</strong> We unconditionally accept all Liquidated Damage and warranty terms stipulated in the NIT.</p>
          </div>

          {/* Signature & Seal Block */}
          <div className="flex items-end justify-between pt-6 border-t border-ink-900/10">
            <div className="border border-dashed border-paper-300 w-36 h-20 flex items-center justify-center text-[11px] text-paper-400 font-mono">
              [ OFFICIAL SEAL ]
            </div>
            <div className="text-right">
              <p className="font-bold text-xs text-ink-900">For {firmName}</p>
              <div className="h-10" />
              <p className="font-semibold text-xs text-ink-900">{form?.contactPerson || 'Authorized Representative'}</p>
              <p className="text-[11px] text-signal-slate">Authorized Signatory & Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
