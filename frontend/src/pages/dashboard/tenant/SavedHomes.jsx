import { useProperties } from '../../../context/PropertiesContext'
import { useSaved } from '../../../context/SavedContext'
import PropertyCard from '../../../components/common/PropertyCard'
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
        <p className="mt-6 py-10 text-center text-sm text-gray-500">Loading saved homes…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {savedProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}

          {savedProperties.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-gray-500">
              No saved homes yet. Browse listings to save your favorites.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
