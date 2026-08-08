import { useEffect, useState } from 'react'
import { ReceiptText } from 'lucide-react'
import * as paymentsApi from '../../../api/payments'
import PageHeader from '../../../components/dashboard/PageHeader'
import PaymentMethodBadge from '../../../components/dashboard/PaymentMethodBadge'

export default function TenantPayments() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    paymentsApi
      .getPayments('tenant')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Track your rent payments" />
        <p className="mt-6 text-center text-sm text-gray-500">Loading payments…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Track your rent payments" />
        <p className="mt-6 text-center text-sm text-red-600">{error || 'Unable to load payments.'}</p>
      </div>
    )
  }

  const { currentRental, nextPayment, history } = data

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track your rent payments" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Next Payment</h3>
          <p className="text-sm text-gray-500">Due {nextPayment.dueDate}</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">${nextPayment.amount}</p>

          <div className="mt-4">
            <PaymentMethodBadge method={currentRental.paymentMethod} />
          </div>

          <button className="mt-5 w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark">
            Pay via ABA QR
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
          <p className="text-sm text-gray-500">Your past rent payments</p>

          {history.length === 0 ? (
            <p className="mt-6 text-center text-sm text-gray-500">No payment history yet.</p>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {history.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-forest">
                      <ReceiptText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{p.month}</p>
                      <p className="truncate text-xs text-gray-500">Paid {p.date}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <PaymentMethodBadge method={p.method} />
                    <span className="text-sm font-semibold text-gray-900">${p.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
