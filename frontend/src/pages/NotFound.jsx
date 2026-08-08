import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6"
    >
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-sm text-gray-600">Page not found.</p>
      <Link to="/" className="mt-6 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark">
        Back to Home
      </Link>
    </motion.div>
  )
}
