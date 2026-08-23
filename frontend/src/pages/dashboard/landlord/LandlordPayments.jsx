import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Table2 } from 'lucide-react'
import * as paymentsApi from '@/api/payments'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import PageHeader from '@/components/dashboard/PageHeader'
import PaymentDonut from '@/components/dashboard/PaymentDonut'
import AbaQrCard from '@/components/dashboard/AbaQrCard'
import SkeletonRow from '@/components/common/SkeletonRow'
import PrintDocumentModal from '@/components/documents/PrintDocumentModal'
import RentalInvoice from '@/components/documents/RentalInvoice'

export default function LandlordPayments() {
  const { user } = useAuth()
  const { properties } = useProperties()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoice, setInvoice] = useState(null)

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
        <PageHeader title="Payments" subtitle="Rent collection and payment methods" />
        <p className="mt-6 text-center text-sm text-red-600">{error || 'Unable to load payments.'}</p>
      </div>
    )
  }

  const { reminders, tenants } = data
  const abaCount = tenants.filter((t) => t.paymentMethod === 'aba').length
  const cashCount = tenants.length - abaCount
  const monthlyRevenue = tenants.reduce((sum, t) => sum + t.rent, 0)

  const openInvoice = (reminder) => {
    const tenant = tenants.find((t) => t.name === reminder.tenant)
    const property =
      properties.find((p) => p.id === tenant?.propertyId) ||
      properties.find((p) => p.title === reminder.property)
    setInvoice({
      id: reminder.id,
      issueDate: new Date().toISOString().slice(0, 10),
      status: tenant?.status === 'paid' ? 'paid' : 'due',
      landlord: user?.name || property?.landlord,
      landlordContact: property?.telegram || property?.phone,
      tenant: reminder.tenant,
      tenantContact: tenant?.telegram,
      propertyTitle: reminder.property || property?.title,
      propertyAddress: [property?.address, property?.city].filter(Boolean).join(', '),
      period: reminder.dueDate,
      amount: reminder.amount,
      method: tenant?.paymentMethod || 'aba',
      items: [{ description: `Monthly rent — due ${reminder.dueDate}`, amount: reminder.amount }],
    })
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Rent collection and payment methods"
        actions={
          <Link
            to="/dashboard/landlord/sheet"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            <Table2 className="h-4 w-4" />
            Landlord sheet
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Payment Reminders</h3>
              <p className="text-sm text-muted-foreground">Upcoming rent due dates</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Monthly revenue: <span className="font-semibold text-foreground">${monthlyRevenue}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.tenant}</p>
                  <p className="text-xs text-muted-foreground">{r.property}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-semibold text-foreground">${r.amount}</p>
                    <p className="text-xs text-amber-600">Due {r.dueDate}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openInvoice(r)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Invoice
                  </button>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">No upcoming payments due.</p>
                <Link
                  to="/dashboard/landlord/contracts"
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  View contracts
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground">Payment Methods</h3>
            <p className="text-sm text-muted-foreground">How tenants are paying</p>
            <PaymentDonut aba={abaCount} cash={cashCount} />
          </div>
          <AbaQrCard />
        </div>
      </div>

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
