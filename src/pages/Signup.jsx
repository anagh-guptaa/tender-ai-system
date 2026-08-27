import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp, usingSupabase } = useAuth()
  const navigate = useNavigate()
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signUp(email, password, orgName)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-5">
      <div className="w-full max-w-md rounded-2xl border border-brass-500/20 bg-paper-50 p-8 shadow-2xl">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-medium text-ink-900">
          Register your desk
        </h1>
        <p className="mt-1 text-sm text-signal-slate">
          Set up an account to start applying for tenders and tracking documentation.
        </p>

        {!usingSupabase && (
          <p className="mt-4 rounded-lg bg-brass-400/15 px-3 py-2 text-xs text-brass-600">
            Demo mode — no backend connected yet. This creates a local session only.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-signal-slate">
              Organisation / Firm name
            </span>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Aster Infra Pvt. Ltd."
              className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-signal-slate">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organisation.com"
              className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-signal-slate">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none ring-brass-500/40 focus:ring-2"
            />
          </label>

          {error && <p className="text-sm text-signal-rust">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-ink-900 py-2.5 text-sm font-semibold text-paper-50 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-signal-slate">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-ink-900 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
