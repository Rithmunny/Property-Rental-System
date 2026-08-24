import { motion } from 'framer-motion'
import { Search, Send, LayoutDashboard } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Browse rentals',
    description: 'Explore verified rental homes across Cambodia and filter by city, type, and budget.',
  },
  {
    icon: Send,
    title: 'Request to rent',
    description: 'Found the right place? Send a rental request directly to the landlord from the listing page.',
  },
  {
    icon: LayoutDashboard,
    title: 'Manage in dashboard',
    description: 'Track your requests, saved homes, payments, and lease details all in one place.',
  },
]

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
    >
      <h1 className="text-2xl font-bold text-foreground">About PRS</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The Property Rental System (PRS) connects tenants with landlords across Cambodia, making
        it simple to browse verified listings, request to rent a property, and manage your rental
        — all in one place.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Whether you're looking for your next home or managing properties as a landlord, PRS gives
        you the tools to search, save favorites, send rental requests, and manage payments
        from a single dashboard.
      </p>

      <h2 id="how-it-works" className="mt-10 text-lg font-semibold text-foreground">How it works</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-2xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/60 text-forest">
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
