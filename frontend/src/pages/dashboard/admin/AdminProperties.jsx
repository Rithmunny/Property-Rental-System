import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProperties } from '@/context/PropertiesContext'
import { useToast } from '@/context/ToastContext'
import * as usersApi from '@/api/users'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'

export default function AdminProperties() {
  const { properties, updateProperty, refresh } = useProperties()
  const { showToast } = useToast()
  const [landlordCount, setLandlordCount] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    usersApi.listLandlords().then((l) => setLandlordCount(l.length))
  }, [])

  const subtitle =
    landlordCount !== null
      ? `${properties.length} listings from ${landlordCount} landlords`
      : `${properties.length} listings`

  const handleToggleAvailable = async (property) => {
    setUpdatingId(property.id)
    try {
      const nextAvailable = !property.available
      await updateProperty(property.id, { available: nextAvailable })
      showToast(nextAvailable ? 'Property marked available' : 'Property marked rented')
      await refresh()
    } catch (err) {
      showToast(err.message || 'Could not update property')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Properties" subtitle={subtitle} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {properties.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">No properties listed on the platform yet.</p>
            <Link
              to="/dashboard/admin/landlords"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Review landlords
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 p-2 sm:p-3">
            {properties.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground sm:hidden">
                    {p.city} · {p.landlord}
                  </p>
                </div>

                <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
                  <div className="hidden sm:block">
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium text-foreground">{p.city}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-muted-foreground">Landlord</p>
                    <p className="font-medium text-foreground">{p.landlord}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium text-foreground">${p.price}/mo</p>
                  </div>
                  <StatusPill
                    label={p.available ? 'Available' : 'Rented'}
                    tone={p.available ? 'positive' : 'neutral'}
                  />
                  <button
                    type="button"
                    disabled={updatingId === p.id}
                    onClick={() => handleToggleAvailable(p)}
                    className="min-h-9 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-60"
                  >
                    {p.available ? 'Mark rented' : 'Mark available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
