import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { CITIES, PROPERTY_TYPES } from '../data/properties'
import { useProperties } from '../context/PropertiesContext'
import PropertyCard from '../components/common/PropertyCard'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Listings() {
  const { properties, loading, error } = useProperties()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState(searchParams.get('city') || 'All')
  const [type, setType] = useState(searchParams.get('type') || 'All')
  const [maxPrice, setMaxPrice] = useState(1000)

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.address.toLowerCase().includes(query.toLowerCase())
      const matchesCity = city === 'All' || p.city === city
      const matchesType = type === 'All' || p.type === type
      const matchesPrice = p.price <= maxPrice
      return matchesQuery && matchesCity && matchesType && matchesPrice
    })
  }, [properties, query, city, type, maxPrice])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-gray-500">
        Loading listings…
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Stays</h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} properties found</p>
        </div>

        <div className="flex items-center rounded-full border border-gray-300 py-2 pl-4 pr-1.5 shadow-sm">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Pill value={city} onChange={setCity} options={['All', ...CITIES]} />
        <Pill value={type} onChange={setType} options={['All', ...PROPERTY_TYPES]} />

        <label className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700">
          Max ${maxPrice}
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-28 accent-forest"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-gray-500">No properties match your filters.</p>
      ) : (
        <motion.div
          key={`${city}-${type}-${query}-${maxPrice}`}
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {filtered.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <PropertyCard property={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function Pill({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none focus:border-forest"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
