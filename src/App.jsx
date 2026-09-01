import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TenderDetail from './pages/TenderDetail'
import ApplicationForm from './pages/ApplicationForm'
import Applications from './pages/Applications'
import Onboarding from './pages/Onboarding'

// Guard: must be logged in
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Guard: must be logged in AND have a company profile
function ProfileRequired({ children }) {
  const { user, company, loading, usingSupabase } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  // Only enforce onboarding if Supabase is connected
  if (usingSupabase && company === null) return <Navigate to="/onboarding" replace />
  return children
}

// Guard: redirect logged-in users away from auth pages
function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
          <Route
            path="/onboarding"
            element={<Protected><Onboarding /></Protected>}
          />
          <Route
            path="/"
            element={<ProfileRequired><Dashboard /></ProfileRequired>}
          />
          <Route
            path="/tenders/:id"
            element={<ProfileRequired><TenderDetail /></ProfileRequired>}
          />
          <Route
            path="/tenders/:id/apply"
            element={<ProfileRequired><ApplicationForm /></ProfileRequired>}
          />
          <Route
            path="/applications"
            element={<ProfileRequired><Applications /></ProfileRequired>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
