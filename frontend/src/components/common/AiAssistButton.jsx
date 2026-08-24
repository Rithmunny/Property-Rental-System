import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AiAssistButton({ onClick, loading, disabled, label = 'AI write', className }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-1.5 rounded-full text-xs', className)}
    >
      <Sparkles className={cn('size-3.5', loading && 'animate-pulse')} />
      {loading ? 'Generating…' : label}
    </Button>
  )
}
