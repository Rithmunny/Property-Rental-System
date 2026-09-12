import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ReceiptText, X, QrCode, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react'
import * as paymentsApi from '@/api/payments'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import { useToast } from '@/context/ToastContext'
import PageHeader from '@/components/dashboard/PageHeader'
import PaymentMethodBadge from '@/components/dashboard/PaymentMethodBadge'
import SkeletonRow from '@/components/common/SkeletonRow'
import PrintDocumentModal from '@/components/documents/PrintDocumentModal'
import RentalInvoice from '@/components/documents/RentalInvoice'
import { fadeUp, stagger, scaleIn } from '@/lib/motion'

export default function TenantPayments() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { properties } = useProperties()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payOpen, setPayOpen] = useState(false)
  // Modal state machine: idle -> checkout (scan QR) -> confirming -> success
  const [checkout, setCheckout] = useState(null)
  const [payStep, setPayStep] = useState('idle')
  const [receipt, setReceipt] = useState(null)
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

  const openCheckout = async () => {
    setPayOpen(true)
    setPayStep('idle')
    setReceipt(null)
    setCheckout(null)
    try {
      const session = await paymentsApi.createSandboxCheckout()
      setCheckout(session)
      setPayStep('checkout')
    } catch (err) {
      setPayOpen(false)
      showToast(err.message || 'Could not start the payment', 'error')
    }
  }

  const confirmPayment = async () => {
    if (!checkout) return
    setPayStep('confirming')
    try {
      const next = await paymentsApi.confirmSandboxCheckout(checkout.paymentId)
      setReceipt(next.receipt)
      setData(next)
      setPayStep('success')
      showToast('Payment successful — receipt saved', 'success')
    } catch (err) {
      setPayStep('checkout')
      showToast(err.message || 'Payment failed', 'error')
    }
  }

  const closePayModal = () => {
    setPayOpen(false)
    setPayStep('idle')
    setCheckout(null)
    setReceipt(null)
  }

  if (loading && !data) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Track your rent payments" />
        <div className="mt-6 rounded-2xl border border-border bg-card p-2 sm:p-3">
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
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border bg-card p-5 lg:col-span-1"
        >
          <h3 className="font-semibold text-foreground">Next Payment</h3>
          <p className="text-sm text-muted-foreground">Due {nextPayment.dueDate}</p>
          <p className="mt-4 text-3xl font-bold text-foreground">${nextPayment.amount}</p>

          <div className="mt-4">
            <PaymentMethodBadge method={currentRental.paymentMethod} />
          </div>

          <button
            type="button"
            onClick={openCheckout}
            className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
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
            className="mt-2 w-full rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            View invoice
          </button>
        </motion.div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground">Payment History</h3>
          <p className="text-sm text-muted-foreground">Your past rent payments</p>

          {history.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">No payment history yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Payments will appear here after your first rent payment.
              </p>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mt-3 flex flex-col divide-y divide-gray-100"
            >
              {history.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-forest">
                      <ReceiptText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{p.month}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.status === 'paid' ? `Paid ${p.date}` : 'Waiting for confirmation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <PaymentMethodBadge method={p.method} />
                    <span className="text-sm font-semibold text-foreground">${p.amount}</span>
                    {p.status === 'paid' && (
                      <button
                        type="button"
                        onClick={() => openInvoice(p)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Invoice
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {payOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={closePayModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full max-w-sm rounded-2xl bg-card p-6"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Pay rent"
            >
              {payStep === 'success' ? (
                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-center py-4 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                  >
                    <CheckCircle2 className="h-9 w-9" />
                  </motion.span>
                  <h2 className="mt-4 text-lg font-bold text-foreground">Payment successful</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ${receipt?.amount} &middot; {receipt?.month}
                  </p>
                  <p className="mt-3 rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                    {receipt?.reference}
                  </p>
                  <button
                    type="button"
                    onClick={closePayModal}
                    className="mt-6 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Pay via ABA QR</h2>
                    <button
                      type="button"
                      onClick={closePayModal}
                      aria-label="Close"
                      className="text-muted-foreground hover:text-muted-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {checkout?.qrImage
                      ? 'Scan your landlord\'s ABA QR in the ABA app, then confirm the sandbox payment below.'
                      : 'Your landlord has not uploaded an ABA QR yet. You can still complete the sandbox payment below.'}
                  </p>

                  {checkout?.qrImage ? (
                    <div className="mx-auto mt-6 w-full max-w-[220px]">
                      <img
                        src={checkout.qrImage}
                        alt={`${checkout.landlord || 'Landlord'} ABA QR`}
                        className="aspect-square w-full rounded-2xl border border-border bg-card object-contain p-2"
                      />
                      <p className="mt-2 text-center text-sm font-semibold text-foreground">
                        ${checkout.amount}
                      </p>
                    </div>
                  ) : (
                    <div className="mx-auto mt-6 flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
                      <QrCode className="h-16 w-16 text-forest" strokeWidth={1.25} />
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Waiting for QR
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        ${checkout?.amount ?? ''}
                      </p>
                    </div>
                  )}

                  {checkout && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Sandbox checkout <span className="font-mono">{checkout.reference}</span>
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={payStep !== 'checkout'}
                    onClick={confirmPayment}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {payStep === 'confirming' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {payStep === 'confirming'
                      ? 'Confirming with gateway…'
                      : 'Simulate successful payment (sandbox)'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
