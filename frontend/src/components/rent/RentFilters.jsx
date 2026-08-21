import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { CITIES, PROPERTY_TYPES } from '@/data/properties'
import { FURNISHED_OPTIONS, PRICE_MAX } from '@/utils/listing'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BED_OPTIONS = [
  { value: 'All', label: 'Any beds' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
]

function FilterSelect({ id, value, onValueChange, items, className }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={cn('h-10 w-full min-w-0 rounded-full', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function PriceFilter({ maxPrice, onMaxPriceChange, className }) {
  return (
    <div
      className={cn(
        'flex h-10 min-w-0 items-center gap-3 rounded-full border border-input px-4 text-sm',
        className,
      )}
    >
      <span className="shrink-0 text-foreground">Max ${maxPrice}</span>
      <input
        type="range"
        min="50"
        max={PRICE_MAX}
        step="50"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(Number(e.target.value))}
        className="min-w-0 flex-1 accent-forest"
        aria-label="Maximum monthly rent"
      />
    </div>
  )
}

function FilterFields({
  idPrefix,
  labeled,
  city,
  onCityChange,
  areaFilter,
  onAreaChange,
  areaOptions,
  type,
  onTypeChange,
  beds,
  onBedsChange,
  furnished,
  onFurnishedChange,
  maxPrice,
  onMaxPriceChange,
}) {
  const cityItems = useMemo(
    () => [{ value: 'All', label: 'All cities' }, ...CITIES.map((c) => ({ value: c, label: c }))],
    [],
  )
  const areaItems = useMemo(
    () => [
      { value: 'All', label: 'All areas' },
      ...areaOptions.map((a) => ({ value: a.name, label: a.name })),
    ],
    [areaOptions],
  )
  const typeItems = useMemo(
    () => [{ value: 'All', label: 'All types' }, ...PROPERTY_TYPES.map((t) => ({ value: t, label: t }))],
    [],
  )
  const furnishedItems = useMemo(
    () => [{ value: 'All', label: 'Any furnishing' }, ...FURNISHED_OPTIONS],
    [],
  )

  const fields = [
    { id: `${idPrefix}-city`, label: 'City', value: city, onValueChange: onCityChange, items: cityItems },
    {
      id: `${idPrefix}-area`,
      label: 'Area',
      value: areaFilter,
      onValueChange: onAreaChange,
      items: areaItems,
    },
    { id: `${idPrefix}-type`, label: 'Type', value: type, onValueChange: onTypeChange, items: typeItems },
    { id: `${idPrefix}-beds`, label: 'Beds', value: beds, onValueChange: onBedsChange, items: BED_OPTIONS },
    {
      id: `${idPrefix}-furnished`,
      label: 'Furnishing',
      value: furnished,
      onValueChange: onFurnishedChange,
      items: furnishedItems,
    },
  ]

  if (!labeled) {
    return (
      <>
        {fields.map((field) => (
          <FilterSelect key={field.id} {...field} className="lg:w-36" />
        ))}
        <PriceFilter maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} className="lg:w-52" />
      </>
    )
  }

  const paired = fields.slice(0, 4)
  const furnishing = fields[4]

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      {paired.map((field) => (
        <div key={field.id} className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <FilterSelect {...field} />
        </div>
      ))}
      <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <Label htmlFor={furnishing.id}>{furnishing.label}</Label>
        <FilterSelect {...furnishing} />
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-price`}>Max rent</Label>
        <PriceFilter maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} />
      </div>
    </div>
  )
}

export default function RentFilters({
  query,
  onQueryChange,
  city,
  onCityChange,
  areaFilter,
  onAreaChange,
  areaOptions,
  type,
  onTypeChange,
  beds,
  onBedsChange,
  furnished,
  onFurnishedChange,
  maxPrice,
  onMaxPriceChange,
  onSubmit,
}) {
  const [open, setOpen] = useState(false)

  const fieldProps = {
    city,
    onCityChange,
    areaFilter,
    onAreaChange,
    areaOptions,
    type,
    onTypeChange,
    beds,
    onBedsChange,
    furnished,
    onFurnishedChange,
    maxPrice,
    onMaxPriceChange,
  }

  const activeCount = [
    city !== 'All',
    areaFilter !== 'All',
    type !== 'All',
    beds !== 'All',
    furnished !== 'All',
    maxPrice < PRICE_MAX,
  ].filter(Boolean).length

  const applyAndClose = () => {
    setOpen(false)
    onSubmit()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3 lg:px-10"
    >
      <div className="relative w-full min-w-0 lg:max-w-xs lg:flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title, street, or area"
          className="h-10 rounded-full pl-9"
        />
      </div>

      <div className="hidden min-w-0 lg:flex lg:flex-1 lg:flex-wrap lg:items-center lg:gap-2">
        <FilterFields idPrefix="rent-lg" labeled={false} {...fieldProps} />
      </div>

      <div className="flex gap-2 lg:contents">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 flex-1 rounded-full lg:hidden"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal />
          Filters
          {activeCount > 0 ? <Badge>{activeCount}</Badge> : null}
        </Button>
        <Button type="submit" size="lg" className="h-10 flex-1 rounded-full lg:w-auto lg:flex-none lg:px-5">
          <Search />
          Update Search
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-6 overflow-hidden p-6 sm:max-w-lg">
          <DialogHeader className="gap-1.5 pr-8 text-left">
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription>Narrow listings by city, type, and budget.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <FilterFields idPrefix="rent-sm" labeled {...fieldProps} />
          </div>
          <DialogFooter className="-mx-6 -mb-6 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyAndClose}>
              Show results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
