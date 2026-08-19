import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { CITIES, PROPERTY_TYPES } from '@/data/properties'
import { areasForCity } from '@/data/areas'
import {
  DEPOSIT_OPTIONS,
  FURNISHED_OPTIONS,
  LEASE_TERM_OPTIONS,
  PROPERTY_DEFAULTS,
} from '@/utils/listing'

const EMPTY_FORM = {
  title: '',
  type: PROPERTY_TYPES[0],
  city: CITIES[0],
  neighbourhood: areasForCity(CITIES[0])[0]?.name ?? '',
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  image: '',
  image2: '',
  image3: '',
  image4: '',
  description: '',
  amenities: '',
  available: true,
  furnished: PROPERTY_DEFAULTS.furnished,
  leaseTermMonths: String(PROPERTY_DEFAULTS.leaseTermMonths),
  depositMonths: String(PROPERTY_DEFAULTS.depositMonths),
  electricityRate: '',
  parkingFee: '0',
  telegram: '',
  whatsapp: '',
  phone: '',
}

export default function PropertyFormModal({ open, title, initialValues, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    if (!initialValues) {
      setForm(EMPTY_FORM)
      return
    }
    setForm({
      ...EMPTY_FORM,
      ...initialValues,
      amenities: (initialValues.amenities || []).join(', '),
      neighbourhood: initialValues.neighbourhood || EMPTY_FORM.neighbourhood,
      furnished: initialValues.furnished || PROPERTY_DEFAULTS.furnished,
      leaseTermMonths: String(initialValues.leaseTermMonths ?? PROPERTY_DEFAULTS.leaseTermMonths),
      depositMonths: String(initialValues.depositMonths ?? PROPERTY_DEFAULTS.depositMonths),
      electricityRate:
        initialValues.electricityRate == null ? '' : String(initialValues.electricityRate),
      parkingFee: String(initialValues.parkingFee ?? 0),
      telegram: initialValues.telegram || '',
      whatsapp: initialValues.whatsapp || '',
      phone: initialValues.phone || '',
      image: initialValues.image || '',
      image2: (initialValues.images || [])[1] || '',
      image3: (initialValues.images || [])[2] || '',
      image4: (initialValues.images || [])[3] || '',
    })
  }, [open, initialValues])

  const areaOptions = useMemo(() => areasForCity(form.city).map((a) => a.name), [form.city])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => {
      const next = { ...f, [name]: type === 'checkbox' ? checked : value }
      if (name === 'city') {
        const names = areasForCity(value).map((a) => a.name)
        if (!names.includes(f.neighbourhood)) {
          next.neighbourhood = names[0] || ''
        }
      }
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cover =
      form.image ||
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'
    const { image2, image3, image4, amenities, ...rest } = form
    onSubmit({
      ...rest,
      price: Number(form.price) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      leaseTermMonths: Number(form.leaseTermMonths),
      depositMonths: Number(form.depositMonths) || 1,
      electricityRate: form.electricityRate === '' ? null : Number(form.electricityRate),
      parkingFee: Number(form.parkingFee) || 0,
      image: cover,
      images: [cover, image2, image3, image4].filter(Boolean),
      amenities: amenities
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

          <SelectField
            label="Neighbourhood"
            name="neighbourhood"
            value={form.neighbourhood}
            onChange={handleChange}
            options={areaOptions}
          />

          <Field label="Address" name="address" value={form.address} onChange={handleChange} required />

          <div className="grid grid-cols-3 gap-4">
            <Field label="Price ($/mo)" name="price" type="number" value={form.price} onChange={handleChange} required />
            <Field label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} />
            <Field label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} />
          </div>

          <Field label="Floor area (m²)" name="area" type="number" value={form.area} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Furnished"
              name="furnished"
              value={form.furnished}
              onChange={handleChange}
              options={FURNISHED_OPTIONS}
            />
            <SelectField
              label="Lease term"
              name="leaseTermMonths"
              value={form.leaseTermMonths}
              onChange={handleChange}
              options={LEASE_TERM_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Deposit"
              name="depositMonths"
              value={form.depositMonths}
              onChange={handleChange}
              options={DEPOSIT_OPTIONS}
            />
            <Field
              label="Parking ($/mo)"
              name="parkingFee"
              type="number"
              value={form.parkingFee}
              onChange={handleChange}
              placeholder="0 if none"
            />
          </div>

          <Field
            label="Electricity ($/kWh)"
            name="electricityRate"
            type="number"
            value={form.electricityRate}
            onChange={handleChange}
            placeholder="Leave blank if unknown"
            step="0.01"
          />

          <Field
            label="Cover image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://... (leave blank for a placeholder photo)"
          />
          <Field
            label="Photo 2 URL"
            name="image2"
            value={form.image2}
            onChange={handleChange}
            placeholder="Optional"
          />
          <Field
            label="Photo 3 URL"
            name="image3"
            value={form.image3}
            onChange={handleChange}
            placeholder="Optional"
          />
          <Field
            label="Photo 4 URL"
            name="image4"
            value={form.image4}
            onChange={handleChange}
            placeholder="Optional"
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

          <Field
            label="Telegram"
            name="telegram"
            value={form.telegram}
            onChange={handleChange}
            placeholder="@username"
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="+85512..."
          />
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+855 12 000 000"
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

function Field({ label, name, type = 'text', value, onChange, required, placeholder, step }) {
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
        step={step}
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
        {options.map((o) => {
          const optionValue = typeof o === 'object' ? String(o.value) : o
          const optionLabel = typeof o === 'object' ? o.label : o
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    </label>
  )
}
