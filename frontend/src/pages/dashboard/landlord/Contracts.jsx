import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, X } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useProperties } from '../../../context/PropertiesContext'
import { useToast } from '../../../context/ToastContext'
import * as rentalsApi from '../../../api/rentals'
import { isLandlordListing } from '../../../utils/dashboard'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'
import SkeletonRow from '../../../components/common/SkeletonRow'

const STATUS_STYLES = {
  active: { label: 'Active', tone: 'positive' },
  'ending soon': { label: 'Ending Soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'neutral' },
}

const EMPTY_FORM = {
  propertyId: '',
  tenant: '',
  rent: '',
  deposit: '',
  startDate: '',
  endDate: '',
}

export default function LandlordContracts() {
  const { user } = useAuth()
  const { properties } = useProperties()
  const { showToast } = useToast()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const listings = properties.filter((p) => isLandlordListing(p, user?.name))

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return rentalsApi
      .listContracts()
      .then(setContracts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openModal = () => {
    const first = listings[0]
    setForm({
      ...EMPTY_FORM,
      propertyId: first ? String(first.id) : '',
      rent: first ? String(first.price) : '',
      deposit: first ? String(first.price * 2) : '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .slice(0, 10),
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => {
      if (name === 'propertyId') {
        const property = listings.find((p) => p.id === Number(value))
        return {
          ...f,
          propertyId: value,
          rent: property ? String(property.price) : f.rent,
          deposit: property ? String(property.price * 2) : f.deposit,
        }
      }
      return { ...f, [name]: value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.propertyId || !form.tenant) {
      showToast('Property and tenant are required')
      return
    }
    setSaving(true)
    try {
      await rentalsApi.createContract({
        propertyId: Number(form.propertyId),
        tenant: form.tenant.trim(),
        rent: Number(form.rent) || 0,
        deposit: Number(form.deposit) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
        status: 'active',
      })
      setModalOpen(false)
      showToast('Contract created')
      await refresh()
    } catch (err) {
      showToast(err.message || 'Could not create contract')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Rental agreements across your properties"
        actions={
          <button
            type="button"
            onClick={openModal}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </button>
        }
      />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-2 sm:p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 p-2 sm:p-3">
            {contracts.map((c) => {
              const property = properties.find((p) => p.id === c.propertyId)
              const status = STATUS_STYLES[c.status] ?? STATUS_STYLES.active
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/60 text-forest">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{property?.title}</p>
                      <p className="truncate text-sm text-gray-500">Tenant: {c.tenant}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 sm:flex-nowrap">
                    <div>
                      <p className="text-gray-400">Rent</p>
                      <p className="font-medium text-gray-900">${c.rent}/mo</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Deposit</p>
                      <p className="font-medium text-gray-900">${c.deposit}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Start</p>
                      <p className="font-medium text-gray-900">{c.startDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">End</p>
                      <p className="font-medium text-gray-900">{c.endDate}</p>
                    </div>
                  </div>

                  <StatusPill label={status.label} tone={status.tone} />
                </div>
              )
            })}

            {contracts.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-gray-500">No contracts on file yet.</p>
                <Link
                  to="/dashboard/landlord/requests"
                  className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
                >
                  Review incoming requests
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">New Contract</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                Property
                <select
                  name="propertyId"
                  required
                  value={form.propertyId}
                  onChange={handleChange}
                  className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
                >
                  {listings.length === 0 && <option value="">No listings available</option>}
                  {listings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                Tenant name
                <input
                  name="tenant"
                  required
                  value={form.tenant}
                  onChange={handleChange}
                  className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Rent ($/mo)
                  <input
                    name="rent"
                    type="number"
                    required
                    value={form.rent}
                    onChange={handleChange}
                    className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Deposit ($)
                  <input
                    name="deposit"
                    type="number"
                    required
                    value={form.deposit}
                    onChange={handleChange}
                    className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Start date
                  <input
                    name="startDate"
                    type="date"
                    required
                    value={form.startDate}
                    onChange={handleChange}
                    className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  End date
                  <input
                    name="endDate"
                    type="date"
                    required
                    value={form.endDate}
                    onChange={handleChange}
                    className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
                  />
                </label>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || listings.length === 0}
                  className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
                >
                  {saving ? 'Creating…' : 'Create contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
