import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'

/** Categories mapped only to types present in seed data */
export const RENT_MENU_COLUMNS = [
  {
    title: 'Homes for Rent',
    items: [
      { label: 'House', type: 'House' },
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
    <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(100vw-2rem,720px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
        {RENT_MENU_COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{col.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={buildRentHref(item)}
                    onClick={onNavigate}
                    className="text-sm text-gray-700 transition-colors hover:text-forest"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 bg-cream/60 px-6 py-3">
        <Link
          to="/rent"
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
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
        isActive || open ? 'text-forest' : 'text-gray-600 hover:text-forest'
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
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Rent by category</p>
      {RENT_MENU_COLUMNS.flatMap((col) =>
        col.items.map((item) => (
          <Link
            key={`${col.title}-${item.label}`}
            to={buildRentHref(item)}
            onClick={onNavigate}
            className="text-sm text-gray-700 hover:text-forest"
          >
            {item.label}
          </Link>
        )),
      )}
      <Link to="/rent" onClick={onNavigate} className="text-sm font-semibold text-forest">
        View all for rent
      </Link>
    </div>
  )
}
