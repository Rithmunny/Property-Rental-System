import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Compass } from 'lucide-react'
import { PHNOM_PENH_AREAS } from '@/data/discover'
import { useProperties } from '@/context/PropertiesContext'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

function areaHref(area) {
  const params = new URLSearchParams()
  params.set('city', 'Phnom Penh')
  params.set('area', area.name)
  return `/rent?${params.toString()}`
}

export default function Discover() {
  const { properties } = useProperties()
  const ppCount = properties.filter((p) => p.city === 'Phnom Penh').length

  return (
    <div className="bg-cream/40">
      <section className="relative overflow-hidden bg-forest text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1596422846543-75c6fc210710?w=1400&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/70 to-forest" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-2xl">
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage"
            >
              <Compass className="h-3.5 w-3.5" />
              Discover
            </motion.p>
            <motion.h1 variants={fadeUp} className="mt-4 text-3xl font-semibold sm:text-5xl">
              Explore areas in Phnom Penh
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
              Pick a neighbourhood that fits your lifestyle — then jump straight into rentals
              filtered for that area.
              {ppCount > 0 && (
                <span className="mt-2 block text-sage">
                  {ppCount} Phnom Penh listing{ppCount === 1 ? '' : 's'} on PRS right now.
                </span>
              )}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6">
              <Link
                to="/rent?city=Phnom+Penh"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sage"
              >
                View all Phnom Penh rentals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Neighbourhoods</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap an area to browse matching rentals
            </p>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PHNOM_PENH_AREAS.map((area) => (
            <motion.div key={area.id} variants={fadeUp}>
              <Link
                to={areaHref(area)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={area.image}
                    alt={area.fullName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-forest shadow">
                    {area.vibe}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                        {area.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {area.fullName}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {area.avgRent}
                      <span className="block text-[10px] font-normal uppercase tracking-wide">
                        /mo guide
                      </span>
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{area.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                    Browse rentals
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">Not sure where to start?</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            BKK1 and Riverside suit first-timers who want cafes and nightlife nearby. Toul Kork and
            BKK3 are calmer for families. Diamond Island is best if you want condo amenities.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/rent?city=Phnom+Penh"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Search Phnom Penh
            </Link>
            <Link
              to="/about#how-it-works"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
            >
              How renting on PRS works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
