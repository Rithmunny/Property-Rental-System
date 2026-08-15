import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, Home as HomeIcon, DollarSign } from 'lucide-react'
import { useProperties } from '../../../context/PropertiesContext'
import * as usersApi from '../../../api/users'
import * as paymentsApi from '../../../api/payments'
import StatCard from '../../../components/dashboard/StatCard'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'
import PaymentDonut from '../../../components/dashboard/PaymentDonut'
import SkeletonRow from '../../../components/common/SkeletonRow'

const LANDLORD_STATUS = {
  active: { label: 'Active', tone: 'positive' },
  pending: { label: 'Pending Review', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'neutral' },
}

const TENANT_STATUS = {
  active: { label: 'Active', tone: 'positive' },
  pending: { label: 'Pending', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'neutral' },
}

export default function AdminOverview() {
  const { properties } = useProperties()
  const [landlords, setLandlords] = useState([])
  const [tenants, setTenants] = useState([])
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      usersApi.listLandlords(),
      usersApi.listTenants(),
      paymentsApi.getPayments('admin'),
    ])
      .then(([l, t, p]) => {
        setLandlords(l)
        setTenants(t)
        setPaymentData(p)
      })
      .finally(() => setLoading(false))
  }, [])

  const abaPct = paymentData?.methods?.aba ?? 0
  const cashPct = paymentData?.methods?.cash ?? 0
  const platformRevenue = paymentData?.totalCollected ?? 0

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform-wide overview of landlords, tenants, and properties." />

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={HomeIcon} label="Total Properties" value={properties.length} />
          <StatCard icon={Building2} label="Total Landlords" value={landlords.length} />
          <StatCard icon={Users} label="Total Tenants" value={tenants.length} />
          <StatCard icon={DollarSign} label="Platform Revenue" value={`$${platformRevenue}`} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Landlords</h3>
            <Link to="/dashboard/admin/landlords" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-500">Property owners on the platform</p>

          {loading ? (
            <div className="mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {landlords.slice(0, 4).map((l) => {
                const status = LANDLORD_STATUS[l.status] ?? LANDLORD_STATUS.active
                return (
                  <div key={l.id} className="flex items-center justify-between py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                        {l.name.charAt(0)}
                      </span>
                      <p className="truncate text-sm font-medium text-gray-900">{l.name}</p>
                    </div>
                    <StatusPill label={status.label} tone={status.tone} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">Platform-wide, across all tenants</p>
          {loading ? (
            <div className="mt-4 flex justify-center">
              <div className="h-40 w-40 animate-pulse rounded-full bg-gray-200" />
            </div>
          ) : (
            <PaymentDonut aba={abaPct} cash={cashPct} />
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Tenants</h3>
            <Link to="/dashboard/admin/tenants" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-500">Renters on the platform</p>

          {loading ? (
            <div className="mt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {tenants.slice(0, 3).map((t) => {
                const status = TENANT_STATUS[t.status] ?? TENANT_STATUS.active
                return (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                        {t.name.charAt(0)}
                      </span>
                      <p className="truncate text-sm font-medium text-gray-900">{t.name}</p>
                    </div>
                    <StatusPill label={status.label} tone={status.tone} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Properties</h3>
            <Link to="/dashboard/admin/properties" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {properties.length} listings from {landlords.length} landlords
          </p>

          {loading ? (
            <div className="mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {properties.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <p className="truncate font-medium text-gray-900">{p.title}</p>
                  <p className="shrink-0 text-gray-500">${p.price}/mo</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
