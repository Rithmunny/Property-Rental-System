import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import { isLandlordListing } from '@/utils/dashboard'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import PropertyFormModal from '@/components/dashboard/PropertyFormModal'

export default function LandlordListings() {
  const { user } = useAuth()
  const { properties, addProperty, updateProperty, deleteProperty } = useProperties()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const listings = properties.filter((p) => isLandlordListing(p, user?.name))

  const openAddModal = () => {
    setEditingProperty(null)
    setModalOpen(true)
  }

  const openEditModal = (property) => {
    setEditingProperty(property)
    setModalOpen(true)
  }

  const handleSubmit = (data) => {
    if (editingProperty) {
      updateProperty(editingProperty.id, data)
    } else {
      addProperty({ ...data, landlord: user.name })
    }
    setModalOpen(false)
  }

  const handleConfirmDelete = (id) => {
    deleteProperty(id)
    setConfirmDeleteId(null)
  }

  return (
    <div>
      <PageHeader
        title="Listings"
        subtitle="Manage your rental properties"
        actions={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="relative h-40 w-full">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3">
                <StatusPill label={p.available ? 'Available' : 'Rented'} tone={p.available ? 'positive' : 'neutral'} />
              </span>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-gray-900">{p.title}</p>
                <p className="shrink-0 font-semibold text-gray-900">${p.price}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{p.city}</p>

              {confirmDeleteId === p.id ? (
                <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-gray-50 py-2">
                  <span className="text-xs text-gray-500">Delete this listing?</span>
                  <button
                    onClick={() => handleConfirmDelete(p.id)}
                    aria-label="Confirm delete"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    aria-label="Cancel delete"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <div className="col-span-full py-10 text-center">
            <p className="text-sm text-gray-500">No listings yet. Add your first property to start receiving requests.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-3 text-sm font-semibold text-forest hover:underline"
            >
              Add a listing
            </button>
          </div>
        )}
      </div>

      <PropertyFormModal
        open={modalOpen}
        title={editingProperty ? 'Edit Listing' : 'Add New Listing'}
        initialValues={editingProperty}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
