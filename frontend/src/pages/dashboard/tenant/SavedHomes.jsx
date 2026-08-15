import { Link } from 'react-router-dom'
import { useProperties } from '../../../context/PropertiesContext'
import { useSaved } from '../../../context/SavedContext'
import PropertyCard from '../../../components/common/PropertyCard'
import SkeletonCard from '../../../components/common/SkeletonCard'
import PageHeader from '../../../components/dashboard/PageHeader'

export default function TenantSavedHomes() {
  const { properties } = useProperties()
  const { savedIds, loading, error } = useSaved()
  const savedProperties = properties.filter((p) => savedIds.includes(p.id))

  return (
    <div>
      <PageHeader title="Saved Homes" subtitle="Properties you've favorited for later" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {savedProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}

          {savedProperties.length === 0 && (
            <div className="col-span-full py-10 text-center">
              <p className="text-sm text-gray-500">No saved homes yet.</p>
              <Link
                to="/listings"
                className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
              >
                Browse listings
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
