import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SHOWCASE } from '@/data/content'
import BrandLogo from '@/components/common/BrandLogo'

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-137px)] max-w-7xl grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={SHOWCASE[0].image.replace('w=400', 'w=1200')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest/70 to-forest/20" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex w-fit items-center text-lg font-bold text-white">
            <BrandLogo className="h-10 w-auto" />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-sage">
              Property Rental System
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-tight text-white">
              Find a place you'll love to come home to.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-200">
              Verified listings, direct messaging with landlords, and no hidden fees — all in
              one place.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-forest">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>

          {children}

          {footer}
        </motion.div>
      </div>
    </div>
  )
}
