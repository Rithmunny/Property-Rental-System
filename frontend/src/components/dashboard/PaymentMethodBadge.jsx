import { Banknote, QrCode } from 'lucide-react'

export default function PaymentMethodBadge({ method }) {
  const isAba = method === 'aba'
  const Icon = isAba ? QrCode : Banknote

  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isAba ? 'bg-sage/60 text-forest' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <Icon className="h-3 w-3" />
      {isAba ? 'ABA QR' : 'Cash'}
    </span>
  )
}
