import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Briefcase, Award, TrendingUp, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { upsertCompanyProfile } from '../lib/api'
import Logo from '../components/Logo'

const REGISTRATION_TYPES = [
  'Private Limited', 'LLP', 'Partnership', 'Proprietorship',
  'Public Limited', 'MSME (Micro)', 'MSME (Small)', 'MSME (Medium)',
  'Startup India Registered', 'PSU / Government Body',
]

const SECTOR_OPTIONS = [
  'IT & Networking', 'Healthcare Equipment', 'Civil & Construction',
  'Infrastructure & Energy', 'Railways & Transport', 'Defence',
  'Education', 'Agriculture', 'Water & Sanitation', 'Electrical & Mechanical',
  'Printing & Stationery', 'Security Services', 'Facility Management', 'Other',
]

const CERT_OPTIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 13485', 'ISO 27001',
  'MSME Registration', 'Startup India', 'RDSO Approved',
  'CDSCO / FDA Approved', 'BIS Certified', 'GeM Registered',
  'NSIC Registered', 'Make in India Certified',
]

export default function Onboarding() {
  const { user, refreshCompany } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: user?.user_metadata?.org_name || '',
    gstin: '',
    pan: '',
    registration_type: 'Private Limited',
    sectors: [],
    certifications: [],
    annual_turnover_lakhs: '',
    years_experience: '',
    contact_email: user?.email || '',
    contact_phone: '',
    website: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleArray(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }))
  }

  async function handleFinish() {
    setSaving(true)
    setError('')
    try {
      const profile = {
        id: user.id,
        ...form,
        annual_turnover_lakhs: parseInt(form.annual_turnover_lakhs) || 0,
        years_experience: parseInt(form.years_experience) || 0,
        contact_email: form.contact_email || user.email,
      }
      const saved = await upsertCompanyProfile(profile)
      refreshCompany(saved)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { n: 1, label: 'Company basics', icon: Building2 },
    { n: 2, label: 'Sectors & certs', icon: Award },
    { n: 3, label: 'Financials', icon: TrendingUp },
  ]

  return (
    <div className="flex min-h-screen bg-paper-50">
      {/* Left panel */}
      <div className="hidden w-72 shrink-0 flex-col bg-ink-900 px-8 py-10 text-paper-50 lg:flex">
        <Logo light />
        <div className="mt-16 flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-brass-400">
            Setup your profile
          </p>
          <p className="font-display text-2xl font-medium leading-snug">
            Help us match you to the right tenders
          </p>
          <p className="text-sm leading-relaxed text-paper-100/70">
            Your profile is used by our AI to check eligibility, spot document gaps,
            and personalise your tender feed. Takes about 3 minutes.
          </p>
        </div>
        {/* Step list */}
        <div className="mt-auto flex flex-col gap-4">
          {steps.map(({ n, label, icon: Icon }) => (
            <div
              key={n}
              className={`flex items-center gap-3 text-sm font-medium transition-colors ${
                step > n
                  ? 'text-signal-green'
                  : step === n
                  ? 'text-paper-50'
                  : 'text-paper-50/30'
              }`}
            >
              {step > n ? (
                <CheckCircle2 size={18} strokeWidth={1.8} className="shrink-0 text-signal-green" />
              ) : (
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={`shrink-0 ${step === n ? 'text-brass-400' : ''}`}
                />
              )}
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          {/* Step 1 — Company basics */}
          {step === 1 && (
            <StepCard
              title="Company basics"
              subtitle="Tell us who you are"
              onNext={() => setStep(2)}
              nextDisabled={!form.name}
            >
              <Field label="Company / Organisation name" required>
                <input
                  className="input w-full"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Acme Infrastructure Pvt Ltd"
                />
              </Field>
              <Field label="Registration type" required>
                <select
                  className="input w-full"
                  value={form.registration_type}
                  onChange={(e) => update('registration_type', e.target.value)}
                >
                  {REGISTRATION_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="GSTIN">
                  <input
                    className="input w-full font-mono"
                    value={form.gstin}
                    onChange={(e) => update('gstin', e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </Field>
                <Field label="PAN">
                  <input
                    className="input w-full font-mono"
                    value={form.pan}
                    onChange={(e) => update('pan', e.target.value.toUpperCase())}
                    placeholder="AAAAA0000A"
                    maxLength={10}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact email">
                  <input
                    className="input w-full"
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => update('contact_email', e.target.value)}
                  />
                </Field>
                <Field label="Contact phone">
                  <input
                    className="input w-full"
                    value={form.contact_phone}
                    onChange={(e) => update('contact_phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
              </div>
              <Field label="Website (optional)">
                <input
                  className="input w-full"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  placeholder="https://yourcompany.in"
                />
              </Field>
            </StepCard>
          )}

          {/* Step 2 — Sectors & certifications */}
          {step === 2 && (
            <StepCard
              title="Sectors & certifications"
              subtitle="What does your company do?"
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              nextDisabled={form.sectors.length === 0}
            >
              <Field label="Primary sectors (select all that apply)" required>
                <div className="mt-1 flex flex-wrap gap-2">
                  {SECTOR_OPTIONS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      active={form.sectors.includes(s)}
                      onClick={() => toggleArray('sectors', s)}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Certifications held">
                <div className="mt-1 flex flex-wrap gap-2">
                  {CERT_OPTIONS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={form.certifications.includes(c)}
                      onClick={() => toggleArray('certifications', c)}
                    />
                  ))}
                </div>
              </Field>
            </StepCard>
          )}

          {/* Step 3 — Financials */}
          {step === 3 && (
            <StepCard
              title="Financial & experience"
              subtitle="Used for eligibility matching"
              onFinish={handleFinish}
              onBack={() => setStep(2)}
              saving={saving}
              error={error}
              isLast
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Annual turnover (₹ lakh)" required>
                  <input
                    className="input w-full font-mono"
                    type="number"
                    min="0"
                    value={form.annual_turnover_lakhs}
                    onChange={(e) => update('annual_turnover_lakhs', e.target.value)}
                    placeholder="e.g. 150"
                  />
                </Field>
                <Field label="Years of operation" required>
                  <input
                    className="input w-full font-mono"
                    type="number"
                    min="0"
                    value={form.years_experience}
                    onChange={(e) => update('years_experience', e.target.value)}
                    placeholder="e.g. 7"
                  />
                </Field>
              </div>
              <div className="rounded-lg bg-brass-500/10 border border-brass-500/20 p-4">
                <p className="text-sm font-medium text-brass-600">Why we ask this</p>
                <p className="mt-1 text-xs text-signal-slate leading-relaxed">
                  Most government tenders specify minimum turnover thresholds.
                  Our AI uses this to calculate your eligibility score for each tender — 
                  the more accurate this is, the better your matches.
                </p>
              </div>
            </StepCard>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepCard({ title, subtitle, children, onNext, onBack, onFinish, nextDisabled, saving, error, isLast }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-signal-slate">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-4">
        {children}
      </div>
      {error && (
        <p className="rounded-lg bg-signal-rust-bg px-4 py-3 text-sm text-signal-rust">{error}</p>
      )}
      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-sm font-medium text-signal-slate hover:text-ink-900"
          >
            ← Back
          </button>
        ) : <span />}
        {isLast ? (
          <button
            onClick={onFinish}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-ink-900 px-6 py-2.5 text-sm font-semibold text-paper-50 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Complete setup'}
            {!saving && <CheckCircle2 size={15} strokeWidth={2} />}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="flex items-center gap-2 rounded-lg bg-ink-900 px-6 py-2.5 text-sm font-semibold text-paper-50 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Continue <ArrowRight size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
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

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-brass-500 bg-brass-500/10 text-brass-600'
          : 'border-ink-900/15 text-signal-slate hover:border-ink-900/30 hover:text-ink-900'
      }`}
    >
      {label}
    </button>
  )
}
