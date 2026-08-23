import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'

/** Categories mapped only to types present in seed data */
export const RENT_MENU_COLUMNS = [
  {
    title: 'Homes for Rent',
    items: [
      { label: 'House', type: 'House' },
      { label: 'Villa', type: 'Villa' },
      { label: 'Apartment', type: 'Apartment' },
      { label: 'Room', type: 'Room' },
    ],
  },
  {
    title: 'Condo & Studio',
    items: [
      { label: 'Condo', type: 'Condo' },
      { label: 'Studio', type: 'Studio' },
    ],
  },
  {
    title: 'Popular cities',
    items: [
      { label: 'Phnom Penh', city: 'Phnom Penh' },
      { label: 'Siem Reap', city: 'Siem Reap' },
      { label: 'Sihanoukville', city: 'Sihanoukville' },
      { label: 'Battambang', city: 'Battambang' },
      { label: 'Kampot', city: 'Kampot' },
      { label: 'Kep', city: 'Kep' },
    ],
  },
]

function buildRentHref({ type, city }) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (city) params.set('city', city)
  const q = params.toString()
  return q ? `/rent?${q}` : '/rent'
}

export default function RentMegaMenu({ onNavigate }) {
  return (
    <div className="mt-2 flex max-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {RENT_MENU_COLUMNS.map((col) => (
            <div key={col.title} className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={buildRentHref(item)}
                      onClick={onNavigate}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-cream/60 px-4 py-3 sm:px-6">
        <Link
          to="/rent"
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          View all properties for rent
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export function RentNavTrigger({ open, onToggle, isActive }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
        isActive || open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
      aria-expanded={open}
    >
      Rent
      <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

export function RentMobileAccordion({ onNavigate }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rent by category</p>
      {RENT_MENU_COLUMNS.flatMap((col) =>
        col.items.map((item) => (
          <Link
            key={`${col.title}-${item.label}`}
            to={buildRentHref(item)}
            onClick={onNavigate}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {item.label}
          </Link>
        )),
      )}
      <Link to="/rent" onClick={onNavigate} className="text-sm font-semibold text-foreground">
        View all for rent
      </Link>
    </div>
  )
}
