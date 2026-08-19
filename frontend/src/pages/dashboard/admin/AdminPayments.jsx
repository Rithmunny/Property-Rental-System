import { useEffect, useState } from 'react'
import * as paymentsApi from '@/api/payments'
import PageHeader from '@/components/dashboard/PageHeader'
import PaymentDonut from '@/components/dashboard/PaymentDonut'

export default function AdminPayments() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    paymentsApi
      .getPayments('admin')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Platform-wide rent collection and payment methods" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
            <div className="mx-auto h-40 w-40 rounded-full bg-gray-200" />
          </div>
          <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-4 h-10 w-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Platform-wide rent collection and payment methods" />
        <p className="mt-6 text-center text-sm text-red-600">{error || 'Unable to load payments.'}</p>
      </div>
    )
  }

  const { totalCollected, pendingCount, methods } = data

  return (
    <div>
      <PageHeader title="Payments" subtitle="Platform-wide rent collection and payment methods" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">How tenants are paying, platform-wide</p>
          <PaymentDonut aba={methods.aba} cash={methods.cash} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">Monthly Collections</h3>
          <p className="text-sm text-gray-500">Rent collected across all tenants</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">${totalCollected}</p>
          <p className="mt-2 text-sm text-gray-500">
            {pendingCount} payment{pendingCount === 1 ? '' : 's'} pending
          </p>
        </div>
      </div>
    </div>
  )
}
