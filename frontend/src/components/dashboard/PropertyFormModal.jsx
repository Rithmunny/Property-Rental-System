import { useEffect, useMemo, useState } from 'react'
import { CITIES, PROPERTY_TYPES } from '@/data/properties'
import { areasForCity } from '@/data/areas'
import {
  DEPOSIT_OPTIONS,
  FURNISHED_OPTIONS,
  LEASE_TERM_OPTIONS,
  PROPERTY_DEFAULTS,
} from '@/utils/listing'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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

  const setField = (name, value) => {
    setForm((f) => {
      const next = { ...f, [name]: value }
      if (name === 'city') {
        const names = areasForCity(value).map((a) => a.name)
        if (!names.includes(f.neighbourhood)) {
          next.neighbourhood = names[0] || ''
        }
      }
      return next
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setField(name, value)
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
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pr-12">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
            <FormSection title="Property">
              <Field label="Title" name="title" value={form.title} onChange={handleChange} required />
              <SelectField
                label="Type"
                value={form.type}
                onValueChange={(value) => setField('type', value)}
                options={PROPERTY_TYPES}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="available"
                  checked={form.available}
                  onCheckedChange={(checked) => setField('available', !!checked)}
                />
                <Label htmlFor="available" className="font-normal">
                  Available for rent
                </Label>
              </div>
            </FormSection>

            <FormSection title="Location">
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="City"
                  value={form.city}
                  onValueChange={(value) => setField('city', value)}
                  options={CITIES}
                />
                <SelectField
                  label="Neighbourhood"
                  value={form.neighbourhood}
                  onValueChange={(value) => setField('neighbourhood', value)}
                  options={areaOptions}
                />
              </div>
              <Field label="Street address" name="address" value={form.address} onChange={handleChange} required />
            </FormSection>

            <FormSection title="Space">
              <div className="grid grid-cols-3 gap-4">
                <Field
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  value={form.bedrooms}
                  onChange={handleChange}
                />
                <Field
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  value={form.bathrooms}
                  onChange={handleChange}
                />
                <Field
                  label="Floor area (m²)"
                  name="area"
                  type="number"
                  value={form.area}
                  onChange={handleChange}
                />
              </div>
              <SelectField
                label="Furnished"
                value={form.furnished}
                onValueChange={(value) => setField('furnished', value)}
                options={FURNISHED_OPTIONS}
              />
            </FormSection>

            <FormSection title="Rent & terms">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Monthly rent ($)"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
                <SelectField
                  label="Deposit"
                  value={form.depositMonths}
                  onValueChange={(value) => setField('depositMonths', value)}
                  options={DEPOSIT_OPTIONS}
                />
              </div>
              <SelectField
                label="Lease term"
                value={form.leaseTermMonths}
                onValueChange={(value) => setField('leaseTermMonths', value)}
                options={LEASE_TERM_OPTIONS}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Parking ($/mo)"
                  name="parkingFee"
                  type="number"
                  value={form.parkingFee}
                  onChange={handleChange}
                  placeholder="0 if none"
                />
                <Field
                  label="Electricity ($/kWh)"
                  name="electricityRate"
                  type="number"
                  value={form.electricityRate}
                  onChange={handleChange}
                  placeholder="Leave blank if unknown"
                  step="0.01"
                />
              </div>
            </FormSection>

            <FormSection title="Photos">
              <Field
                label="Cover photo URL"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Leave blank for a placeholder"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  label="Photo 2"
                  name="image2"
                  value={form.image2}
                  onChange={handleChange}
                  placeholder="Optional"
                />
                <Field
                  label="Photo 3"
                  name="image3"
                  value={form.image3}
                  onChange={handleChange}
                  placeholder="Optional"
                />
                <Field
                  label="Photo 4"
                  name="image4"
                  value={form.image4}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </FormSection>

            <FormSection title="Description">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">About this listing</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <Field
                label="Amenities"
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Wi-Fi, Parking, Air Conditioning"
              />
            </FormSection>

            <FormSection title="Contact">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+855 12 000 000"
              />
            </FormSection>
          </div>

          <DialogFooter className="mx-0 mb-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save listing</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormSection({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, name, type = 'text', value, onChange, required, placeholder, step }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
      />
    </div>
  )
}

function SelectField({ label, value, onValueChange, options }) {
  const stringValue = String(value ?? '')
  if (!stringValue) return null

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Select value={stringValue} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[70]">
          {options.map((o) => {
            const optionValue = typeof o === 'object' ? String(o.value) : o
            const optionLabel = typeof o === 'object' ? o.label : o
            return (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
