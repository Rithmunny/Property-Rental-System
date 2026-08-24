import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as aiApi from '@/api/ai'

const STARTER = {
  role: 'assistant',
  content:
    'Hi! I\'m the PRS rental assistant. Ask about areas, budgets, deposits, or describe the home you want — e.g. "2 bed in BKK1 under 500".',
}

export default function RentalAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([STARTER])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const send = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    try {
      const { reply } = await aiApi.chatAssistant(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages([
        ...next,
        { role: 'assistant', content: err.message || 'Something went wrong. Please try again.' },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
          aria-label="Open rental assistant"
        >
          <Sparkles className="size-4" />
          Ask AI
        </button>
      )}

      {open && (
        <div className="fixed right-4 bottom-4 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-6 sm:bottom-6">
          <header className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">PRS Assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {busy && (
              <p className="text-xs text-muted-foreground">Thinking…</p>
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rentals…"
              className="min-w-0 flex-1 rounded-full border border-border px-3 py-2 text-sm outline-none focus:border-ring"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} className="shrink-0 rounded-full">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
