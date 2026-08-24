import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import { isLandlordListing } from '@/utils/dashboard'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import PropertyFormModal from '@/components/dashboard/PropertyFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
          <Button type="button" size="lg" className="px-5" onClick={openAddModal}>
            <Plus />
            Add listing
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((p) => (
          <Card key={p.id} className="py-0">
            <div className="relative h-40 w-full">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3">
                <StatusPill
                  label={p.available ? 'Available' : 'Rented'}
                  tone={p.available ? 'positive' : 'neutral'}
                />
              </span>
            </div>

            <CardContent className="pb-4">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-foreground">{p.title}</p>
                <p className="shrink-0 font-semibold text-foreground">
                  ${p.price}
                  <span className="text-xs font-medium text-muted-foreground">/mo</span>
                </p>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {p.neighbourhood ? `${p.neighbourhood} · ` : ''}
                {p.city}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {p.type}
                {p.bedrooms ? ` · ${p.bedrooms} bed` : ''}
                {p.area ? ` · ${p.area} m²` : ''}
              </p>

              {confirmDeleteId === p.id ? (
                <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-muted py-2">
                  <span className="text-xs text-muted-foreground">Delete this listing?</span>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="destructive"
                    onClick={() => handleConfirmDelete(p.id)}
                    aria-label="Confirm delete"
                  >
                    <Check />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="outline"
                    onClick={() => setConfirmDeleteId(null)}
                    aria-label="Cancel delete"
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(p)}
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmDeleteId(p.id)}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {listings.length === 0 && (
          <div className="col-span-full py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No listings yet. Add your first property to start receiving requests.
            </p>
            <Button type="button" variant="link" className="mt-1" onClick={openAddModal}>
              Add a listing
            </Button>
          </div>
        )}
      </div>

      <PropertyFormModal
        open={modalOpen}
        title={editingProperty ? 'Edit listing' : 'Add listing'}
        initialValues={editingProperty}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
