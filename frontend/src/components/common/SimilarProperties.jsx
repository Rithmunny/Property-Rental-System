import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import * as aiApi from '@/api/ai'
import RentalCard from '@/components/common/RentalCard'

export default function SimilarProperties({ propertyId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    setLoading(true)
    aiApi
      .getSimilarProperties(propertyId, 4)
      .then((result) => setItems(result.properties || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [propertyId])

  if (loading) {
    return (
      <section className="py-6">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" />
          Similar homes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Finding recommendations…</p>
      </section>
    )
  }

  if (!items.length) return null

  return (
    <section className="border-t border-border py-8">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" />
        Similar homes you might like
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Matched by location, size, and amenities
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((property) => (
          <RentalCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}
