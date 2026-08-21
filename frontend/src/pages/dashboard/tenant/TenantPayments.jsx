import { useCallback, useEffect, useState } from 'react'
import { ReceiptText, X, QrCode } from 'lucide-react'
import * as paymentsApi from '@/api/payments'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import { useToast } from '@/context/ToastContext'
import PageHeader from '@/components/dashboard/PageHeader'
import PaymentMethodBadge from '@/components/dashboard/PaymentMethodBadge'
import SkeletonRow from '@/components/common/SkeletonRow'
import PrintDocumentModal from '@/components/documents/PrintDocumentModal'
import RentalInvoice from '@/components/documents/RentalInvoice'

export default function TenantPayments() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { properties } = useProperties()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payOpen, setPayOpen] = useState(false)
  const [paying, setPaying] = useState(false)
  const [invoice, setInvoice] = useState(null)

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
  const rentalProperty = properties.find((p) => p.id === currentRental?.propertyId)

  const openInvoice = (payment) => {
    setInvoice({
      id: payment.id,
      issueDate: payment.date,
      paidDate: payment.status === 'paid' ? payment.date : null,
      status: payment.status === 'paid' ? 'paid' : 'due',
      landlord: currentRental?.landlord || rentalProperty?.landlord,
      landlordContact: currentRental?.landlordTelegram || rentalProperty?.telegram,
      tenant: user?.name,
      tenantContact: user?.email,
      propertyTitle: rentalProperty?.title || 'Current rental',
      propertyAddress: [rentalProperty?.address, rentalProperty?.city].filter(Boolean).join(', '),
      period: payment.month,
      amount: payment.amount,
      method: payment.method,
      items: [{ description: `Monthly rent — ${payment.month}`, amount: payment.amount }],
    })
  }

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
          <button
            type="button"
            onClick={() =>
              openInvoice({
                id: 'next',
                month: `Rent due ${nextPayment.dueDate}`,
                amount: nextPayment.amount,
                method: currentRental.paymentMethod,
                status: 'due',
                date: new Date().toISOString().slice(0, 10),
              })
            }
            className="mt-2 w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            View invoice
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
                    <button
                      type="button"
                      onClick={() => openInvoice(p)}
                      className="text-xs font-semibold text-forest hover:underline"
                    >
                      Invoice
                    </button>
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
              {currentRental.abaQrImage
                ? 'Scan your landlord\'s ABA QR in the ABA app, then confirm below.'
                : 'Your landlord has not uploaded an ABA QR yet. Contact them, or mark as paid after you transfer.'}
            </p>

            {currentRental.abaQrImage ? (
              <div className="mx-auto mt-6 w-full max-w-[220px]">
                <img
                  src={currentRental.abaQrImage}
                  alt={`${currentRental.landlord || 'Landlord'} ABA QR`}
                  className="aspect-square w-full rounded-2xl border border-gray-200 bg-white object-contain p-2"
                />
                <p className="mt-2 text-center text-sm font-semibold text-gray-900">
                  ${nextPayment.amount}
                </p>
              </div>
            ) : (
              <div className="mx-auto mt-6 flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
                <QrCode className="h-16 w-16 text-forest" strokeWidth={1.25} />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Waiting for QR
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">${nextPayment.amount}</p>
              </div>
            )}

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

      <PrintDocumentModal
        open={Boolean(invoice)}
        title="Rental invoice"
        invoice={invoice}
        onClose={() => setInvoice(null)}
      >
        <RentalInvoice invoice={invoice} />
      </PrintDocumentModal>
    </div>
  )
}
