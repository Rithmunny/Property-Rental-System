import { useCallback, useEffect, useState } from 'react'
import { ReceiptText, X, QrCode } from 'lucide-react'
import * as paymentsApi from '../../../api/payments'
import { useToast } from '../../../context/ToastContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import PaymentMethodBadge from '../../../components/dashboard/PaymentMethodBadge'
import SkeletonRow from '../../../components/common/SkeletonRow'

export default function TenantPayments() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payOpen, setPayOpen] = useState(false)
  const [paying, setPaying] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return paymentsApi
      .getPayments('tenant')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleMarkPaid = async () => {
    setPaying(true)
    try {
      const next = await paymentsApi.markPaymentPaid({
        amount: data?.nextPayment?.amount,
      })
      setData(next)
      setPayOpen(false)
      showToast('Payment marked as paid')
    } catch (err) {
      showToast(err.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  if (loading && !data) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Track your rent payments" />
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

          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="mt-5 w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
          >
            Pay via ABA QR
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
          <p className="text-sm text-gray-500">Your past rent payments</p>

          {history.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">No payment history yet.</p>
              <p className="mt-1 text-xs text-gray-400">
                Payments will appear here after your first rent payment.
              </p>
            </div>
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

      {payOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Pay via ABA QR</h2>
              <button
                type="button"
                onClick={() => setPayOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Scan this mock QR in the ABA app, then confirm below.
            </p>

            <div className="mx-auto mt-6 flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
              <QrCode className="h-16 w-16 text-forest" strokeWidth={1.25} />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                ABA QR Placeholder
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">${nextPayment.amount}</p>
            </div>

            <button
              type="button"
              disabled={paying}
              onClick={handleMarkPaid}
              className="mt-6 w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
            >
              {paying ? 'Saving…' : 'Mark as paid'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
