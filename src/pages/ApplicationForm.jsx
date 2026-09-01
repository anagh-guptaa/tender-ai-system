import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { getTenderById, upsertApplication, getApplicationForTender } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { tenders as mockTenders } from '../lib/mockTenders'

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
  })
  const [checkedDocs, setCheckedDocs] = useState({})

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
            setForm(existing.form_data)
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
        <div className="flex flex-col gap-4 rounded-xl border border-ink-900/10 bg-white p-5 lg:col-span-2">
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
          <Field label="Additional notes">
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="input resize-none"
              placeholder="Anything the evaluation committee should know…"
            />
          </Field>
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
