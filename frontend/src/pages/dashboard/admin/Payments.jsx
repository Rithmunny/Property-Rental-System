import { TENANTS } from '../../../data/landlord'
import PageHeader from '../../../components/dashboard/PageHeader'
import PaymentDonut from '../../../components/dashboard/PaymentDonut'
import PaymentMethodBadge from '../../../components/dashboard/PaymentMethodBadge'

export default function AdminPayments() {
  const abaCount = TENANTS.filter((t) => t.paymentMethod === 'aba').length
  const cashCount = TENANTS.length - abaCount
  const platformRevenue = TENANTS.reduce((sum, t) => sum + t.rent, 0)

  return (
    <div>
      <PageHeader title="Payments" subtitle="Platform-wide rent collection and payment methods" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">How tenants are paying, platform-wide</p>
          <PaymentDonut aba={abaCount} cash={cashCount} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">Monthly Collections</h3>
          <p className="text-sm text-gray-500">Rent collected across all tenants</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">${platformRevenue}</p>

          <div className="mt-5 flex flex-col divide-y divide-gray-100">
            {TENANTS.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <p className="font-medium text-gray-900">{t.name}</p>
                <div className="flex items-center gap-3">
                  <PaymentMethodBadge method={t.paymentMethod} />
                  <span className="text-gray-600">${t.rent}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
