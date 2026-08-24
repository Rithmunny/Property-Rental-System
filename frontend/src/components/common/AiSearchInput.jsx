import { useState } from 'react'
import { Sparkles, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import * as aiApi from '@/api/ai'

export default function AiSearchInput({
  value,
  onChange,
  onParsed,
  placeholder = 'Try: 2 bed furnished in BKK1 under $500',
  className,
  inputClassName,
  showAiButton = true,
}) {
  const [parsing, setParsing] = useState(false)
  const [hint, setHint] = useState('')

  const handleAiParse = async () => {
    const query = String(value || '').trim()
    if (!query) return
    setParsing(true)
    setHint('')
    try {
      const result = await aiApi.parseNaturalSearch(query)
      onParsed?.(result.filters, result.summary)
      setHint(result.summary)
    } catch (err) {
      setHint(err.message || 'Could not parse search')
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (showAiButton && value?.trim()) {
      handleAiParse()
    } else {
      onParsed?.({ q: value?.trim() || '' })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="relative flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              onChange?.(e.target.value)
              if (hint) setHint('')
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn('h-10 rounded-full pl-9', inputClassName)}
          />
        </div>
        {showAiButton && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleSubmit}
            disabled={parsing || !value?.trim()}
            className="h-10 shrink-0 gap-1.5 rounded-full px-4"
            title="Parse with AI"
          >
            {parsing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            <span className="hidden sm:inline">AI</span>
          </Button>
        )}
      </div>
      {hint && <p className="px-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
