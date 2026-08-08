import { motion } from 'framer-motion'

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">About PRS</h1>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        The Property Rental System (PRS) connects tenants with landlords, making it simple to
        browse verified listings, request to rent a property, and manage bookings — all in one
        place.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        This frontend build is ready for backend integration. All data flows through a unified API
        layer (`src/api/`) that currently uses mock adapters. Your backend teammate can implement
        the REST endpoints defined in <code className="text-forest">API_CONTRACT.md</code> and
        switch <code className="text-forest">VITE_USE_MOCK=false</code> to connect the live server.
      </p>
    </motion.div>
  )
}
