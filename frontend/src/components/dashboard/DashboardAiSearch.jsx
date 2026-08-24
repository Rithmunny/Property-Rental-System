import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AiSearchInput from '@/components/common/AiSearchInput'
import { PRICE_MAX } from '@/utils/listing'

export default function DashboardAiSearch({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleParsed = (filters) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.city) params.set('city', filters.city)
    if (filters.type) params.set('type', filters.type)
    if (filters.area) params.set('area', filters.area)
    if (filters.beds) params.set('beds', String(filters.beds))
    if (filters.furnished) params.set('furnished', filters.furnished)
    if (filters.maxPrice && Number(filters.maxPrice) < PRICE_MAX) {
      params.set('maxPrice', String(filters.maxPrice))
    }
    onOpenChange(false)
    navigate(`/rent?${params.toString()}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            AI property search
          </DialogTitle>
          <DialogDescription>
            Describe what you need in plain language — we&apos;ll turn it into filters on the Rent page.
          </DialogDescription>
        </DialogHeader>
        <AiSearchInput
          value={query}
          onChange={setQuery}
          onParsed={handleParsed}
          placeholder='e.g. "furnished 2 bed in BKK1 under $600"'
        />
      </DialogContent>
    </Dialog>
  )
}
