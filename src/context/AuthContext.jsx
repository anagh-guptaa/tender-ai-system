import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)
const LOCAL_KEY = 'dossier_mock_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const usingSupabase = Boolean(supabase)

  useEffect(() => {
    if (usingSupabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
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
    } else {
      // Demo mode: no backend yet, so any credentials create a local session.
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
      setUser(data.user)
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
  }

  return (
    <AuthContext.Provider value={{ user, loading, usingSupabase, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
