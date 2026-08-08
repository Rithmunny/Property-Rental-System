import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { CITIES, PROPERTY_TYPES } from '../../data/properties'

const EMPTY_FORM = {
  title: '',
  type: PROPERTY_TYPES[0],
  city: CITIES[0],
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  image: '',
  description: '',
  amenities: '',
  available: true,
}

export default function PropertyFormModal({ open, title, initialValues, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm(
      initialValues
        ? { ...EMPTY_FORM, ...initialValues, amenities: (initialValues.amenities || []).join(', ') }
        : EMPTY_FORM
    )
  }, [open, initialValues])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      price: Number(form.price) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      image:
        form.image ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
      amenities: form.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Field label="Title" name="title" value={form.title} onChange={handleChange} required />

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Type" name="type" value={form.type} onChange={handleChange} options={PROPERTY_TYPES} />
            <SelectField label="City" name="city" value={form.city} onChange={handleChange} options={CITIES} />
          </div>

          <Field label="Address" name="address" value={form.address} onChange={handleChange} required />

          <div className="grid grid-cols-3 gap-4">
            <Field label="Price ($/mo)" name="price" type="number" value={form.price} onChange={handleChange} required />
            <Field label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} />
            <Field label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} />
          </div>

          <Field label="Area (m²)" name="area" type="number" value={form.area} onChange={handleChange} />
          <Field
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://... (leave blank for a placeholder photo)"
          />

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/15"
            />
          </label>

          <Field
            label="Amenities (comma-separated)"
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="Wi-Fi, Parking, Air Conditioning"
          />

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 accent-forest"
            />
            Available for rent
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
            >
              Save Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, required, placeholder }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/15"
      />
    </label>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
      {label}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/15"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
