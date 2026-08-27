import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app runs fully without these — AuthContext falls back to a local
// mock session so the UI is demoable before Supabase is wired up.
// To connect a real Supabase project: create a .env file with
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
export const supabase = url && anonKey ? createClient(url, anonKey) : null
