const TONE_CLASSES = {
  positive: 'bg-sage/60 text-forest',
  warning: 'bg-amber-100 text-amber-700',
  neutral: 'bg-gray-100 text-gray-600',
}

export default function StatusPill({ label, tone = 'neutral' }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>{label}</span>
  )
}
