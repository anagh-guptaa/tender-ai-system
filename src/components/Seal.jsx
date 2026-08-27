const styles = {
  Open: {
    ring: 'border-signal-green text-signal-green',
    bg: 'bg-signal-green-bg',
    dot: 'bg-signal-green',
  },
  'Closing Soon': {
    ring: 'border-brass-500 text-brass-600',
    bg: 'bg-brass-400/15',
    dot: 'bg-brass-500',
  },
  Closed: {
    ring: 'border-signal-slate text-signal-slate',
    bg: 'bg-ink-900/5',
    dot: 'bg-signal-slate',
  },
}

// The portal's signature mark: every tender carries a circular, seal-like
// status stamp — a nod to the physical stamps on real tender documents.
export default function Seal({ status, size = 'md' }) {
  const s = styles[status] ?? styles.Closed
  const dims = size === 'sm' ? 'h-6 w-6 text-[9px]' : 'h-9 w-9 text-[10px]'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] ${s.ring} ${s.bg} ${dims} font-mono uppercase tracking-tight`}
      title={status}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
    </span>
  )
}

export function StatusPill({ status }) {
  const s = styles[status] ?? styles.Closed
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.ring} ${s.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}
