import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as paymentsApi from '../../../api/payments'
import PageHeader from '../../../components/dashboard/PageHeader'
import PaymentDonut from '../../../components/dashboard/PaymentDonut'
import SkeletonRow from '../../../components/common/SkeletonRow'

export default function LandlordPayments() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    paymentsApi
      .getPayments('landlord')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Rent collection and payment methods" />
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Rent collection and payment methods" />
        <p className="mt-6 text-center text-sm text-red-600">{error || 'Unable to load payments.'}</p>
      </div>
    )
  }

  const { reminders, tenants } = data
  const abaCount = tenants.filter((t) => t.paymentMethod === 'aba').length
  const cashCount = tenants.length - abaCount
  const monthlyRevenue = tenants.reduce((sum, t) => sum + t.rent, 0)

  return (
    <div>
      <PageHeader title="Payments" subtitle="Rent collection and payment methods" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Payment Reminders</h3>
              <p className="text-sm text-gray-500">Upcoming rent due dates</p>
            </div>
            <p className="text-sm text-gray-500">
              Monthly revenue: <span className="font-semibold text-gray-900">${monthlyRevenue}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.tenant}</p>
                  <p className="text-xs text-gray-500">{r.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${r.amount}</p>
                  <p className="text-xs text-amber-600">Due {r.dueDate}</p>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-gray-500">No upcoming payments due.</p>
                <Link
                  to="/dashboard/landlord/contracts"
                  className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
                >
                  View contracts
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">How tenants are paying</p>
          <PaymentDonut aba={abaCount} cash={cashCount} />
        </div>
      </div>
    </div>
  )
}
