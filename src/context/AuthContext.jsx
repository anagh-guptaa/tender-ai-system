import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCompanyProfile } from '../lib/api'

const AuthContext = createContext(null)
const LOCAL_KEY = 'dossier_mock_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const usingSupabase = Boolean(supabase)

  async function loadCompany(authUser) {
    if (!authUser || !usingSupabase) return
    try {
      const profile = await getCompanyProfile(authUser.id)
      setCompany(profile)
    } catch {
      setCompany(null)
    }
  }

  useEffect(() => {
    if (usingSupabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        const authUser = data.session?.user ?? null
        setUser(authUser)
        await loadCompany(authUser)
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        await loadCompany(authUser)
      })
      return () => sub.subscription.unsubscribe()
    } else {
      const stored = localStorage.getItem(LOCAL_KEY)
      setUser(stored ? JSON.parse(stored) : null)
      setLoading(false)
    }
  }, [usingSupabase])

  async function signIn(email, password) {
    if (usingSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(data.user)
      await loadCompany(data.user)
    } else {
      const mockUser = { id: 'demo-' + email, email }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
    }
  }

  async function signUp(email, password, orgName) {
    if (usingSupabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { org_name: orgName } },
      })
      if (error) throw error
      // When "Confirm email" is OFF in Supabase, data.session is populated immediately.
      // Use the session user so the auth token is active for API calls right away.
      const authUser = data.session?.user ?? data.user
      setUser(authUser)
      // New user — no company profile yet, will be prompted to onboard
      setCompany(null)
    } else {
      const mockUser = { id: 'demo-' + email, email, orgName }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
    }
  }

  async function signOut() {
    if (usingSupabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(LOCAL_KEY)
    }
    setUser(null)
    setCompany(null)
  }

  function refreshCompany(updatedProfile) {
    setCompany(updatedProfile)
  }

  return (
    <AuthContext.Provider
      value={{ user, company, loading, usingSupabase, signIn, signUp, signOut, refreshCompany }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
