import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Building2, Heart, Map as MapIcon, LayoutGrid, BellPlus } from 'lucide-react'
import { areasForCity } from '@/data/areas'
import { PRICE_MAX, matchesPropertyFilters, normalizeFilter } from '@/utils/listing'
import { useProperties } from '@/context/PropertiesContext'
import { useAuth } from '@/context/AuthContext'
import { useAlerts } from '@/context/AlertsContext'
import { useToast } from '@/context/ToastContext'
import RentalCard from '@/components/common/RentalCard'
import SkeletonCard from '@/components/common/SkeletonCard'
import RentMap from '@/components/rent/RentMap'
import RentFilters from '@/components/rent/RentFilters'

export default function Rent() {
  const { properties, loading, error, refresh } = useProperties()
  const { user } = useAuth()
  const { saveCurrentSearch, hasSearch } = useAlerts()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(normalizeFilter(searchParams.get('city')))
  const [type, setType] = useState(normalizeFilter(searchParams.get('type')))
  const [areaFilter, setAreaFilter] = useState(normalizeFilter(searchParams.get('area')))
  const [beds, setBeds] = useState(searchParams.get('beds') || 'All')
  const [furnished, setFurnished] = useState(normalizeFilter(searchParams.get('furnished')))
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || PRICE_MAX)
  const [sort, setSort] = useState('newest')
  const [mobileView, setMobileView] = useState('list')
  const [activeId, setActiveId] = useState(null)
  const [savingSearch, setSavingSearch] = useState(false)
  const cardRefs = useRef({})

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
    setCity(normalizeFilter(searchParams.get('city')))
    setType(normalizeFilter(searchParams.get('type')))
    setAreaFilter(normalizeFilter(searchParams.get('area')))
    setBeds(searchParams.get('beds') || 'All')
    setFurnished(normalizeFilter(searchParams.get('furnished')))
    setMaxPrice(Number(searchParams.get('maxPrice')) || PRICE_MAX)
  }, [searchParams])

  const areaOptions = useMemo(() => areasForCity(city === 'All' ? 'All' : city), [city])

  const currentFilters = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || '',
      area: searchParams.get('area') || '',
      type: searchParams.get('type') || '',
      beds: searchParams.get('beds') || '',
      furnished: searchParams.get('furnished') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    }),
    [searchParams],
  )

  const buildParams = (filters = {}) => {
    const params = new URLSearchParams()
    const q = filters.q ?? query
    const c = filters.city ?? city
    const t = filters.type ?? type
    const a = filters.area ?? areaFilter
    const b = filters.beds ?? beds
    const f = filters.furnished ?? furnished
    const max = filters.maxPrice != null ? Number(filters.maxPrice) : maxPrice

    if (String(q || '').trim()) params.set('q', String(q).trim())
    if (c && c !== 'All') params.set('city', c)
    if (t && t !== 'All') params.set('type', t)
    if (a && a !== 'All') params.set('area', a)
    if (b && b !== 'All') params.set('beds', String(b))
    if (f && f !== 'All') params.set('furnished', f)
    if (max < PRICE_MAX) params.set('maxPrice', String(max))
    return params
  }

  const applySearch = (e) => {
    e?.preventDefault()
    setSearchParams(buildParams())
  }

  const handleAiParsed = (filters, summary) => {
    if (filters.q != null) setQuery(filters.q)
    if (filters.city) setCity(filters.city)
    if (filters.type) setType(filters.type)
    if (filters.area) setAreaFilter(filters.area)
    if (filters.beds) setBeds(String(filters.beds))
    if (filters.furnished) setFurnished(filters.furnished)
    if (filters.maxPrice) setMaxPrice(Number(filters.maxPrice) || PRICE_MAX)
    setSearchParams(buildParams(filters))
    if (summary) showToast(summary)
  }

  const handleCityChange = (value) => {
    setCity(value)
    const names = areasForCity(value === 'All' ? 'All' : value).map((a) => a.name)
    if (areaFilter !== 'All' && !names.includes(areaFilter)) {
      setAreaFilter('All')
    }
  }

  const filtered = useMemo(() => {
    let list = properties.filter((p) => matchesPropertyFilters(p, currentFilters))
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    else list = [...list].sort((a, b) => b.id - a.id)
    return list
  }, [properties, currentFilters, sort])

  useEffect(() => {
    if (!activeId) return
    cardRefs.current[activeId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeId])

  const clearFilters = () => {
    setQuery('')
    setCity('All')
    setType('All')
    setAreaFilter('All')
    setBeds('All')
    setFurnished('All')
    setMaxPrice(PRICE_MAX)
    setSearchParams({})
  }

  const handleSaveSearch = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'tenant') {
      showToast('Log in as a tenant to save searches')
      return
    }
    setSavingSearch(true)
    try {
      await saveCurrentSearch(currentFilters)
      showToast('Search saved — we will alert you in-app')
    } catch (err) {
      showToast(err.message || 'Could not save search')
    } finally {
      setSavingSearch(false)
    }
  }

  const landlordCta = user?.role === 'landlord' ? '/dashboard/landlord/listings' : '/register'
  const tenantCta =
    user?.role === 'tenant' ? '/dashboard/tenant/saved' : user ? '/rent' : '/register'
  const searchAlreadySaved = hasSearch?.(currentFilters)

  return (
    <div className="bg-cream/40 min-h-[70vh]">
      <div className="sticky top-[104px] z-30 border-b border-border bg-background/95 backdrop-blur">
        <RentFilters
          query={query}
          onQueryChange={setQuery}
          city={city}
          onCityChange={handleCityChange}
          areaFilter={areaFilter}
          onAreaChange={setAreaFilter}
          areaOptions={areaOptions}
          type={type}
          onTypeChange={setType}
          beds={beds}
          onBedsChange={setBeds}
          furnished={furnished}
          onFurnishedChange={setFurnished}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          onSubmit={applySearch}
          onAiParsed={handleAiParsed}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Properties for Rent</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? 'Loading…' : `${filtered.length} rental${filtered.length === 1 ? '' : 's'} found`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={savingSearch || searchAlreadySaved}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-60"
            >
              <BellPlus className="h-4 w-4" />
              {searchAlreadySaved ? 'Search saved' : savingSearch ? 'Saving…' : 'Save this search'}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground outline-none focus:border-ring"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <div className="flex rounded-full border border-border p-0.5 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mobileView === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileView('map')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mobileView === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to={landlordCta}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Building2 className="h-3.5 w-3.5" />
            Post a property
          </Link>
          <button
            type="button"
            onClick={() => navigate(tenantCta)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-accent"
          >
            <Heart className="h-3.5 w-3.5" />
            {user?.role === 'tenant' ? 'My saved homes' : 'Save homes'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
          <div className={mobileView === 'map' ? 'hidden lg:block' : ''}>
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
                <p className="text-muted-foreground">No rentals match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    ref={(el) => {
                      cardRefs.current[p.id] = el
                    }}
                  >
                    <RentalCard
                      property={p}
                      highlighted={activeId === p.id}
                      onHover={setActiveId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`${mobileView === 'list' ? 'hidden lg:block' : ''} lg:sticky lg:top-[180px] lg:h-[calc(100vh-200px)]`}
          >
            <RentMap properties={filtered} activeId={activeId} onSelect={setActiveId} />
          </div>
        </div>
      </div>
    </div>
  )
}
