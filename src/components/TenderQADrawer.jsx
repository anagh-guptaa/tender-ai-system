import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, X, Send, Bot, User, RotateCcw, Copy, Check,
  Loader2, ShieldAlert, FileText, ChevronRight, HelpCircle
} from 'lucide-react'
import { answerTenderQuestion } from '../lib/gemini'
import MarkdownRenderer from './MarkdownRenderer'

const QUICK_CHIPS = [
  { label: '💰 EMD & Exemption', query: 'Is EMD required for this tender, and are MSEs or Startups exempt?' },
  { label: '⚠️ Penalty & LD Clauses', query: 'What are the penalty and liquidated damage clauses for delays?' },
  { label: '💳 Payment Terms', query: 'What are the milestone payment terms and billing schedule?' },
  { label: '🛠️ Warranty & SLA', query: 'What are the warranty duration and technical maintenance SLA requirements?' },
  { label: '📋 Mandatory Documents', query: 'What mandatory documents and certificates must be uploaded with the bid?' },
  { label: '⏳ Deadlines & Schedule', query: 'What are the critical submission deadlines and bid validity period?' },
]

export default function TenderQADrawer({ isOpen, onClose, tender }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize or reset chat whenever drawer opens with a specific tender
  useEffect(() => {
    if (isOpen && tender) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: `👋 Hello! I am **TenderAI**, your dedicated compliance assistant for **${tender.title || 'this tender'}** (Ref: \`${tender.id || 'N/A'}\`).\n\nI have analyzed this tender's specifications, budget (${tender.estimated_value || 'N/A'}), eligibility, and submission terms. Click any quick query below or type your question!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, tender?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (!isOpen || !tender) return null

  async function handleSend(queryText) {
    const textToSend = (queryText || input).trim()
    if (!textToSend || loading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Pass previous chat turns for conversational grounding
      const responseText = await answerTenderQuestion(textToSend, tender, messages)
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ **Unable to analyze query:** ${err.message || 'Please try rephrasing your question.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleResetChat() {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Conversation cleared. Ask any new compliance question regarding **${tender.id}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  function handleCopyMessage(text, idx) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Click outside to close backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Main Drawer Container */}
      <div className="relative flex h-full w-full max-w-xl flex-col bg-paper-50 shadow-2xl border-l border-ink-900/10">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-ink-900/10 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brass-500/20 to-brass-600/10 text-brass-700 shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold text-ink-950">
                  Ask TenderAI
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-signal-green/10 px-2 py-0.5 text-[10px] font-semibold text-signal-green">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
                  Live NIT Grounding
                </span>
              </div>
              <p className="font-mono text-[11px] text-signal-slate truncate max-w-xs" title={tender.id}>
                {tender.id} · {tender.organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset conversation"
              className="rounded-lg p-2 text-signal-slate hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close drawer"
              className="rounded-lg p-2 text-signal-slate hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick-Prompt Chips Carousel */}
        <div className="border-b border-ink-900/10 bg-white/70 px-4 py-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-signal-slate shrink-0 mr-1 flex items-center gap-1">
              <HelpCircle size={12} />
              Quick Queries:
            </span>
            {QUICK_CHIPS.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(chip.query)}
                disabled={loading}
                className="shrink-0 rounded-lg border border-ink-900/10 bg-white px-2.5 py-1 text-xs font-medium text-ink-900 hover:border-brass-500 hover:bg-brass-500/5 transition-all disabled:opacity-50 shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brass-500/15 text-brass-700 text-xs font-semibold mt-1">
                    <Bot size={15} />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-ink-900 text-paper-50 rounded-tr-none'
                      : 'bg-white border border-ink-900/10 text-ink-900 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div>
                      <MarkdownRenderer content={msg.text} />
                      
                      {/* Copy Action & Timestamp */}
                      <div className="mt-2.5 pt-2 border-t border-ink-900/5 flex items-center justify-between text-[10px] text-signal-slate">
                        <span className="font-mono">{msg.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, index)}
                          className="flex items-center gap-1 hover:text-ink-900 transition-colors"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check size={11} className="text-signal-green" />
                              <span className="text-signal-green">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper-50 text-xs font-semibold mt-1">
                    <User size={14} />
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brass-500/15 text-brass-700 mt-1">
                <Loader2 size={14} className="animate-spin text-brass-600" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-ink-900/10 bg-white px-4 py-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-signal-slate">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass-500 animate-ping" />
                  Analyzing tender specifications & compliance clauses...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input Bar */}
        <div className="border-t border-ink-900/10 bg-white p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about EMD, penalty, payment terms, required certificates..."
                rows={2}
                disabled={loading}
                className="input text-xs w-full resize-none pr-10 py-2 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper-50 hover:bg-ink-800 transition-colors disabled:opacity-40"
              title="Send question"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </form>

          <p className="mt-2 text-[10px] text-center text-signal-slate">
            Grounded directly on NIT Ref <span className="font-mono text-ink-900">{tender.id}</span> · Verify against official bidding documents
          </p>
        </div>

      </div>
    </div>
  )
}
