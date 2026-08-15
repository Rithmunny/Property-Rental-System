import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, Bath, Ruler, MapPin, CheckCircle2, Star, Heart } from 'lucide-react'
import { useProperties } from '../context/PropertiesContext'
import { useAuth } from '../context/AuthContext'
import { useRequests } from '../context/RequestsContext'
import { useSaved } from '../context/SavedContext'
import { useToast } from '../context/ToastContext'

export default function PropertyDetail() {
  const { id } = useParams()
  const { properties, loading: propertiesLoading } = useProperties()
  const property = properties.find((p) => p.id === Number(id))
  const { user } = useAuth()
  const { createRequest, checkHasRequest } = useRequests()
  const { isSaved, toggleSaved } = useSaved()
  const { showToast } = useToast()
  const [requested, setRequested] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [requestError, setRequestError] = useState(null)
  const liked = isSaved(Number(id))

  useEffect(() => {
    if (!user || !id) return
    checkHasRequest(Number(id)).then(setRequested)
  }, [user, id, checkHasRequest])

  if (propertiesLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-gray-500">
        Loading property…
      </div>
    )
  }

  if (!property) return <Navigate to="/listings" replace />

  const handleRequest = async () => {
    setRequestPending(true)
    setRequestError(null)
    try {
      await createRequest(property.id)
      setRequested(true)
      showToast('Request sent!')
    } catch (err) {
      setRequestError(err.message || 'Could not send request')
    } finally {
      setRequestPending(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSavePending(true)
    try {
      const nowSaved = await toggleSaved(property.id)
      showToast(nowSaved ? 'Saved' : 'Removed from saved')
    } finally {
      setSavePending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10"
    >
      <Link to="/listings" className="text-sm text-gray-600 hover:underline">
        &larr; Back to listings
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{property.title}</h1>
        {user ? (
          <button
            onClick={handleSave}
            disabled={savePending}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-forest text-forest' : 'text-gray-700'}`} />
            {savePending ? 'Saving…' : liked ? 'Saved' : 'Save'}
          </button>
        ) : (
          <Link
            to="/login"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Heart className="h-4 w-4 text-gray-700" />
            Save
          </Link>
        )}
      </div>
      <p className="mt-1 flex items-center gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-gray-900" />
          {property.rating} &middot; {property.reviews} reviews
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {property.address}, {property.city}
        </span>
      </p>

      <div className="mt-4 overflow-hidden rounded-xl">
        <img src={property.image} alt={property.title} className="h-80 w-full object-cover" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="font-semibold text-gray-900">
                {property.type} hosted by {property.landlord}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {property.bedrooms} bedrooms &middot; {property.bathrooms} bathrooms &middot;{' '}
                {property.area}m&sup2;
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white">
              {property.landlord.charAt(0)}
            </span>
          </div>

          <div className="flex gap-6 border-b border-gray-200 py-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-gray-900" /> {property.bedrooms} Bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-gray-900" /> {property.bathrooms} Bathrooms
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-gray-900" /> {property.area}m&sup2;
            </span>
          </div>

          <div className="border-b border-gray-200 py-6">
            <p className="text-sm leading-relaxed text-gray-600">{property.description}</p>
          </div>

          <div className="py-6">
            <h2 className="font-semibold text-gray-900">What this place offers</h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-gray-900" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-300 p-6 shadow-lg">
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-semibold text-gray-900">
              ${property.price} <span className="text-sm font-normal text-gray-500">month</span>
            </p>
            <span className="flex items-center gap-1 text-sm text-gray-700">
              <Star className="h-3.5 w-3.5 fill-gray-900" />
              {property.rating}
            </span>
          </div>

          {property.available ? (
            requested ? (
              <p className="mt-4 rounded-full bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                Request sent! The landlord will contact you soon.
              </p>
            ) : user ? (
              <>
                {requestError && (
                  <p className="mt-4 rounded-full bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                    {requestError}
                  </p>
                )}
                <button
                  onClick={handleRequest}
                  disabled={requestPending}
                  className="mt-4 w-full rounded-full bg-forest px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
                >
                  {requestPending ? 'Sending…' : 'Request to Rent'}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mt-4 block w-full rounded-full bg-forest px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
              >
                Log in to Request
              </Link>
            )
          ) : (
            <p className="mt-4 rounded-full bg-gray-100 px-3 py-2.5 text-center text-sm text-gray-600">
              Currently unavailable
            </p>
          )}
        </aside>
      </div>
    </motion.div>
  )
}
