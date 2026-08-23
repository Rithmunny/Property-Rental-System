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
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
      <Link to="/" className="mt-6 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Back to Home
      </Link>
    </motion.div>
  )
}
