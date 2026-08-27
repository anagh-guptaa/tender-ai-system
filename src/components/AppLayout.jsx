import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, FileStack, LogOut, ScrollText } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Tender Board', icon: LayoutGrid, end: true },
  { to: '/applications', label: 'My Applications', icon: FileStack },
]

export default function AppLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-ink-900/10 px-5 py-6 md:flex">
          <Logo />
          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ink-900 text-paper-50'
                      : 'text-ink-700 hover:bg-ink-900/5'
                  }`
                }
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-ink-900/10 pt-4">
            <p className="truncate font-mono text-xs text-signal-slate">{user?.email}</p>
            <button
              onClick={handleSignOut}
              className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-signal-rust"
            >
              <LogOut size={15} strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4 md:hidden">
            <Logo />
            <button onClick={handleSignOut} className="text-ink-700">
              <LogOut size={18} strokeWidth={1.8} />
            </button>
          </header>
          <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
          <footer className="flex items-center gap-2 border-t border-ink-900/10 px-5 py-4 text-xs text-signal-slate md:px-10">
            <ScrollText size={13} />
            Listings are illustrative placeholder data — connect the scraper to go live.
          </footer>
        </div>
      </div>
    </div>
  )
}
