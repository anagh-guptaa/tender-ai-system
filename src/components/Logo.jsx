export default function Logo({ className = '', light = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="13.5" stroke="#C9972A" strokeWidth="1.5" />
        <circle cx="15" cy="15" r="9" stroke="#C9972A" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M11 15.5L13.6 18L19.5 12" stroke="#C9972A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? 'text-paper-50' : 'text-ink-900'}`}>
        TenderDesk
      </span>
    </div>
  )
}
