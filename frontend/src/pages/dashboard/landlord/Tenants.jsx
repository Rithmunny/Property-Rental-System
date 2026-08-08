import { useProperties } from '../../../context/PropertiesContext'
import { TENANTS } from '../../../data/landlord'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'
import PaymentMethodBadge from '../../../components/dashboard/PaymentMethodBadge'
import TelegramIcon from '../../../components/dashboard/TelegramIcon'

const STATUS_STYLES = {
  paid: { label: 'Paid', tone: 'positive' },
  pending: { label: 'Pending', tone: 'warning' },
}

export default function LandlordTenants() {
  const { properties } = useProperties()

  return (
    <div>
      <PageHeader title="Tenants" subtitle="Contact and payment status for each renter" />

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
        <div className="flex flex-col divide-y divide-gray-100">
          {TENANTS.map((t) => {
            const property = properties.find((p) => p.id === t.propertyId)
            const status = STATUS_STYLES[t.status]
            return (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                    {t.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{t.name}</p>
                    <p className="truncate text-sm text-gray-500">{property?.title}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p className="mr-2 text-sm text-gray-600">${t.rent}/mo</p>
                  <PaymentMethodBadge method={t.paymentMethod} />
                  <StatusPill label={status.label} tone={status.tone} />
                  <a
                    href={`https://t.me/${t.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Message ${t.name} on Telegram`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-forest hover:text-forest"
                  >
                    <TelegramIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
