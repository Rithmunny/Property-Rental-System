import { Monitor, Moon, Sun } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', hint: 'Cream paper, forest ink', icon: Sun },
  { value: 'dark', label: 'Dark', hint: 'Charcoal and white', icon: Moon },
  { value: 'system', label: 'System', hint: 'Match this device', icon: Monitor },
]

export default function ThemeToggle({ variant = 'icon', className }) {
  const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme()
  const reduceMotion = useReducedMotion()

  if (variant === 'panel') {
    return (
      <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-3', className)} role="radiogroup" aria-label="Appearance">
        {OPTIONS.map(({ value, label, hint, icon: Icon }) => {
          const selected = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  const nextLabel = resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = resolvedTheme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className
      )}
    >
      <Icon
        className={cn('h-4 w-4', !reduceMotion && 'transition-transform duration-200')}
      />
    </button>
  )
}
