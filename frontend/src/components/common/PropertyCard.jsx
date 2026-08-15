import { Link, useNavigate } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSaved } from '../../context/SavedContext'
import { useToast } from '../../context/ToastContext'

export default function PropertyCard({ property }) {
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
    <Link to={`/listings/${property.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <button
          onClick={toggleLike}
          aria-label="Save"
          className="absolute right-3 top-3 transition-transform hover:scale-110"
        >
          <Heart
            className={`h-6 w-6 drop-shadow ${saved ? 'fill-forest text-forest' : 'fill-black/30 text-white'}`}
          />
        </button>

        {!property.available && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow">
            Rented
          </span>
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {property.city} &middot; {property.type}
          </p>
          <span className="flex shrink-0 items-center gap-1 text-sm text-gray-900">
            <Star className="h-3.5 w-3.5 fill-gray-900" />
            {property.rating}
          </span>
        </div>
        <p className="truncate text-sm text-gray-500">{property.address}</p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">${property.price}</span> month
        </p>
      </div>
    </Link>
  )
}
