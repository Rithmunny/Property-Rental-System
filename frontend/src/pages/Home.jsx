import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowUpRight, ArrowRight } from 'lucide-react'
import { PROPERTY_TYPES, CITIES } from '@/data/properties'
import { HERO_IMAGE, SHOWCASE, STATS, HELP_ITEMS } from '@/data/content'
import { useCountUp } from '@/hooks/useCountUp'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function Home() {
  const navigate = useNavigate()
  const [type, setType] = useState('Any')
  const [city, setCity] = useState('Any')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (type !== 'Any') params.set('type', type)
    if (city !== 'Any') params.set('city', city)
    navigate(`/rent?${params.toString()}`)
  }

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl">
            <img
              src={HERO_IMAGE}
              alt="Modern rental home"
              className="h-[480px] w-full object-cover sm:h-[560px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-4xl font-semibold text-white drop-shadow-sm sm:text-6xl"
              >
                Find Your Dream
                <br />
                Rental Home
              </motion.h1>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onSubmit={handleSearch}
            className="absolute inset-x-4 -bottom-8 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl bg-card p-3 shadow-xl sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:py-2 sm:pl-6"
          >
            <SearchField label="Property Type" value={type} onChange={setType} options={['Any', ...PROPERTY_TYPES]} />
            <div className="hidden h-8 w-px bg-border sm:block" />
            <SearchField label="Location" value={city} onChange={setCity} options={['Any', ...CITIES]} />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:ml-3"
            >
              <Search className="h-4 w-4" />
              Find Property
            </button>
          </motion.form>
        </motion.div>
      </section>

      {/* Best Residence */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-semibold text-foreground sm:text-4xl">
            Best Residence From Us For You
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm leading-relaxed text-muted-foreground">
            Browse verified rental homes across the country — from cozy studios to spacious
            family houses — and find the place that fits your life and your budget.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {SHOWCASE.map((item) => (
            <motion.div key={item.label} variants={fadeUp} className="group">
              <Link to={`/rent?type=${encodeURIComponent(item.type)}`} className="block">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="mt-3 text-center text-sm font-medium text-foreground group-hover:text-primary">
                  {item.label}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-cream py-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-10"
        >
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </section>

      {/* Feature card + photos */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <motion.div
            variants={fadeUp}
            className="flex aspect-square flex-col justify-between rounded-2xl bg-sage p-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-forest">
                Real Estate is Real Property that Consists of Land
              </h3>
            </div>
            <Link
              to="/rent"
              className="flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              See All
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          {SHOWCASE.slice(0, 2).map((item) => (
            <motion.div key={item.label} variants={fadeUp} className="overflow-hidden rounded-2xl">
              <img src={item.image} alt={item.label} className="aspect-square w-full object-cover" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How we can help */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-semibold text-foreground sm:text-4xl">
              How We Can Help You
            </motion.h2>

            <div className="mt-8 divide-y divide-border">
              {HELP_ITEMS.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} className="flex items-start gap-4 py-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl"
          >
            <img
              src={SHOWCASE[2].image}
              alt="Rental home"
              className="h-full min-h-72 w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 gap-8 rounded-3xl bg-forest p-8 sm:p-12 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sage">
              Community Collection
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Building a Lucrative Portfolio
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Real estate is property consisting of land and buildings, along with natural
              resources. Join thousands of tenants and landlords already using PRS.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-forest hover:bg-cream"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border-4 border-white/10">
            <img
              src={SHOWCASE[3].image}
              alt="Rental home"
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        </motion.div>
      </section>
    </div>
  )
}

function SearchField({ label, value, onChange, options }) {
  const id = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex min-w-0 flex-1 flex-col px-3 py-1 text-left">
      <label htmlFor={id} className="text-[11px] font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          size="sm"
          className="h-auto w-full min-w-0 border-none bg-transparent p-0 text-sm font-medium text-foreground shadow-none focus-visible:border-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start" className="min-w-48">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function StatItem({ stat }) {
  const { ref, value } = useCountUp(stat.value)
  return (
    <div ref={ref} className="text-center sm:text-left">
      <p className="text-3xl font-semibold text-foreground sm:text-4xl">
        {value.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
    </div>
  )
}
