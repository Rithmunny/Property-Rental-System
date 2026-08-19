import { useEffect, useMemo, useState } from 'react'
import { Download, Printer, FileText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import * as paymentsApi from '@/api/payments'
import * as rentalsApi from '@/api/rentals'
import PageHeader from '@/components/dashboard/PageHeader'
import SkeletonRow from '@/components/common/SkeletonRow'
import PrintDocumentModal from '@/components/documents/PrintDocumentModal'
import RentalInvoice from '@/components/documents/RentalInvoice'
import { downloadCsv, downloadLandlordSheetPdf, money, printDocument } from '@/utils/documents'

function statusLabel(status) {
  if (status === 'paid') return 'Paid'
  if (status === 'pending') return 'Pending'
  return status || '—'
}

export default function LandlordSheet() {
  const { user } = useAuth()
  const { properties } = useProperties()
  const [tenants, setTenants] = useState([])
  const [reminders, setReminders] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    Promise.all([paymentsApi.getPayments('landlord'), rentalsApi.listContracts()])
      .then(([pay, list]) => {
        setTenants(pay.tenants ?? [])
        setReminders(pay.reminders ?? [])
        setContracts(list ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => {
    return tenants.map((tenant) => {
      const property = properties.find((p) => p.id === tenant.propertyId)
      const contract = contracts.find(
        (c) => c.propertyId === tenant.propertyId && c.tenant === tenant.name,
      )
      const reminder = reminders.find((r) => r.tenant === tenant.name)
      return {
        tenant,
        property,
        contract,
        reminder,
      }
    })
  }, [tenants, properties, contracts, reminders])

  const totals = useMemo(() => {
    const rent = rows.reduce((sum, row) => sum + Number(row.tenant.rent || 0), 0)
    const deposit = rows.reduce((sum, row) => sum + Number(row.contract?.deposit || 0), 0)
    const paid = rows.filter((row) => row.tenant.status === 'paid').length
    const pending = rows.filter((row) => row.tenant.status !== 'paid').length
    return { rent, deposit, paid, pending }
  }, [rows])

  const openInvoice = (row) => {
    const period =
      row.reminder?.dueDate ||
      new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    setInvoice({
      id: row.tenant.id,
      issueDate: new Date().toISOString().slice(0, 10),
      status: row.tenant.status === 'paid' ? 'paid' : 'due',
      landlord: user?.name || propertyLandlord(row.property),
      landlordContact: row.property?.phone || row.property?.telegram,
      tenant: row.tenant.name,
      tenantContact: row.tenant.telegram,
      propertyTitle: row.property?.title || 'Rental property',
      propertyAddress: [row.property?.address, row.property?.city].filter(Boolean).join(', '),
      period,
      amount: row.tenant.rent,
      method: row.tenant.paymentMethod,
      items: [{ description: `Monthly rent — ${period}`, amount: row.tenant.rent }],
    })
  }

  const exportPdf = async () => {
    setPdfBusy(true)
    try {
      await downloadLandlordSheetPdf({
        landlord: user?.name,
        rows,
        totals,
      })
    } finally {
      setPdfBusy(false)
    }
  }

  const exportCsv = () => {
    const header = [
      'Tenant',
      'Property',
      'Address',
      'Monthly rent',
      'Deposit',
      'Method',
      'Status',
      'Next due',
      'Lease start',
      'Lease end',
      'Contact',
    ]
    const body = rows.map(({ tenant, property, contract, reminder }) => [
      tenant.name,
      property?.title || '',
      [property?.address, property?.city].filter(Boolean).join(', '),
      tenant.rent,
      contract?.deposit ?? '',
      tenant.paymentMethod === 'cash' ? 'Cash' : 'ABA QR',
      statusLabel(tenant.status),
      reminder?.dueDate || '',
      contract?.startDate || '',
      contract?.endDate || '',
      tenant.telegram || '',
    ])
    downloadCsv(`prs-landlord-sheet-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body])
  }

  return (
    <div>
      <PageHeader
        title="Landlord sheet"
        subtitle="Rent roll of tenants, amounts, and lease dates"
        actions={
          !loading && rows.length > 0 ? (
            <div className="no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
              <button
                type="button"
                onClick={exportPdf}
                disabled={pdfBusy}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {pdfBusy ? 'Downloading…' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={printDocument}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                Print sheet
              </button>
            </div>
          ) : null
        }
      />

      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <div className="print-sheet mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="hidden border-b border-gray-200 px-5 py-4 print:block">
            <p className="text-lg font-bold text-gray-900">PRS landlord sheet</p>
            <p className="text-sm text-gray-500">
              Prepared {new Date().toLocaleDateString()} · {user?.name || 'Landlord'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-4 py-4 sm:grid-cols-4">
            <Stat label="Monthly rent" value={money(totals.rent)} />
            <Stat label="Deposits held" value={money(totals.deposit)} />
            <Stat label="Paid" value={String(totals.paid)} />
            <Stat label="Pending" value={String(totals.pending)} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tenant</th>
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold">Rent</th>
                  <th className="px-4 py-3 font-semibold">Deposit</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="no-print px-4 py-3 font-semibold">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.tenant.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{row.tenant.name}</p>
                      <p className="text-xs text-gray-400">{row.tenant.telegram}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{row.property?.title || '—'}</p>
                      <p className="text-xs text-gray-400">
                        {[row.property?.neighbourhood, row.property?.city].filter(Boolean).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{money(row.tenant.rent)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.contract ? money(row.contract.deposit) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.tenant.status === 'paid' ? 'text-green-700' : 'text-amber-700'
                        }
                      >
                        {statusLabel(row.tenant.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.reminder?.dueDate || '—'}</td>
                    <td className="no-print px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openInvoice(row)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                      No tenants on the sheet yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function propertyLandlord(property) {
  return property?.landlord || 'Landlord'
}
