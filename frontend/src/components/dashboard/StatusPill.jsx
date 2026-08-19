import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TONE_CLASS = {
  positive: 'border-transparent bg-secondary text-primary',
  warning: 'border-transparent bg-amber-100 text-amber-800',
  neutral: '',
}

export default function StatusPill({ label, tone = 'neutral' }) {
  return (
    <Badge
      variant={tone === 'neutral' ? 'outline' : 'secondary'}
      className={cn(TONE_CLASS[tone])}
    >
      {label}
    </Badge>
  )
}
