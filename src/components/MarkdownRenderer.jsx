import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null

  return (
    <div className={`prose-container text-xs sm:text-sm text-ink-900 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="font-display text-lg sm:text-xl font-bold text-ink-950 border-b-2 border-brass-500 pb-2 mt-4 mb-3" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="font-display text-sm sm:text-base font-semibold text-ink-900 border-b border-ink-900/10 pb-1.5 mt-5 mb-2.5 text-brass-700 flex items-center gap-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="font-display text-xs sm:text-sm font-semibold text-ink-900 mt-3 mb-1.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-1.5 leading-relaxed text-ink-900" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-2 ml-4 list-disc space-y-1 text-ink-900" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1 text-ink-900 font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-1 leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-ink-950" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-ink-900/10 shadow-xs">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-paper-100 text-ink-950 font-semibold border-b border-ink-900/10" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-ink-900/5 bg-white" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-paper-50/80 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 font-semibold text-ink-950" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2 text-ink-900 align-top" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-2.5 border-l-4 border-brass-500 bg-brass-500/5 px-3.5 py-2 text-xs italic text-ink-800 rounded-r" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-t border-ink-900/10" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            <code className="rounded bg-ink-900/5 px-1.5 py-0.5 font-mono text-[11px] text-ink-900" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
