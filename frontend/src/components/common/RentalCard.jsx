import { Link, useNavigate } from 'react-router-dom'
import { Heart, BedDouble, Bath, Ruler, MapPin } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSaved } from '@/context/SavedContext'
import { useToast } from '@/context/ToastContext'
import { furnishedLabel } from '@/utils/listing'

export default function RentalCard({ property, highlighted, onHover }) {
  const { user } = useAuth()
  const { isSaved, toggleSaved } = useSaved()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const saved = isSaved(property.id)

  const toggleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    const nowSaved = await toggleSaved(property.id)
    showToast(nowSaved ? 'Saved' : 'Removed from saved')
  }

  return (
    <Link
      to={`/listings/${property.id}`}
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md ${
        highlighted ? 'border-forest shadow-md ring-2 ring-forest/30' : 'border-gray-200'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={toggleLike}
          aria-label="Save"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition-transform hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 ${saved ? 'fill-forest text-forest' : 'text-gray-600'}`}
          />
        </button>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow ${
            property.available
              ? 'bg-forest text-white'
              : 'bg-white text-gray-800'
          }`}
        >
          {property.available ? 'Available' : 'Rented'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-forest">
          {property.title}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" />
            {property.area}m²
          </span>
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {property.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {property.bathrooms}
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1 truncate text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.neighbourhood
            ? `${property.neighbourhood} · ${furnishedLabel(property.furnished)}`
            : `${property.address}, ${property.city}`}
        </p>

        <p className="mt-auto pt-3 text-base font-bold text-forest">
          ${property.price}
          <span className="text-sm font-medium text-gray-500">/Month</span>
        </p>
      </div>
    </Link>
  )
}
