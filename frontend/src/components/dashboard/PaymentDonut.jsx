export default function PaymentDonut({ aba, cash }) {
  const total = aba + cash
  const abaPct = total ? Math.round((aba / total) * 100) : 0
  const circumference = 2 * Math.PI * 45
  const abaLength = (abaPct / 100) * circumference

  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1f2e24"
            strokeWidth="10"
            strokeDasharray={`${abaLength} ${circumference - abaLength}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <p className="text-2xl font-bold text-foreground">{abaPct}%</p>
          <p className="text-xs text-muted-foreground">via ABA QR</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-5 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-forest" /> ABA QR ({aba})
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Cash ({cash})
        </span>
      </div>
    </div>
  )
}
