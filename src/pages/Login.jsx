import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, usingSupabase } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #C9972A 0, #C9972A 1px, transparent 1px, transparent 44px), repeating-linear-gradient(90deg, #C9972A 0, #C9972A 1px, transparent 1px, transparent 44px)',
        }}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-brass-500/20 bg-paper-50 p-8 shadow-2xl">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-medium text-ink-900">
          Sign in to your desk
        </h1>
        <p className="mt-1 text-sm text-signal-slate">
          Track tenders, manage documents, and file applications in one place.
        </p>

        {!usingSupabase && (
          <p className="mt-4 rounded-lg bg-brass-400/15 px-3 py-2 text-xs text-brass-600">
            Demo mode — no backend connected yet. Any email/password creates a local session.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-signal-slate">
          New here?{' '}
          <Link to="/signup" className="font-medium text-ink-900 underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
