import { Link } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'

const SOCIAL_ICONS = [
  {
    label: 'Facebook',
    path: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z',
  },
  {
    label: 'Instagram',
    path: 'M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.5.5.7.3 1.2.6 1.8 1.2.6.6.9 1.1 1.2 1.8.3.7.5 1.4.5 2.5.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.5 2.5-.3.7-.6 1.2-1.2 1.8-.6.6-1.1.9-1.8 1.2-.7.3-1.4.5-2.5.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.5-.5-.7-.3-1.2-.6-1.8-1.2-.6-.6-.9-1.1-1.2-1.8-.3-.7-.5-1.4-.5-2.5C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1.1.2-1.8.5-2.5.3-.7.6-1.2 1.2-1.8.6-.6 1.1-.9 1.8-1.2.7-.3 1.4-.5 2.5-.5C8.9 2 9.3 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.3a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6ZM17.5 6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z',
  },
  {
    label: 'Twitter',
    path: 'M22 5.9c-.7.3-1.5.6-2.4.7a4.1 4.1 0 0 0 1.8-2.3c-.8.5-1.7.8-2.7 1a4.2 4.2 0 0 0-7.2 3.9A12 12 0 0 1 2.9 4.6a4.3 4.3 0 0 0 1.3 5.6 4.1 4.1 0 0 1-1.9-.5v.1a4.3 4.3 0 0 0 3.4 4.2c-.6.2-1.3.2-1.9.1a4.3 4.3 0 0 0 4 3 8.4 8.4 0 0 1-6.2 1.7 11.9 11.9 0 0 0 6.4 1.9c7.7 0 11.9-6.4 11.9-11.9v-.5c.8-.6 1.5-1.3 2.1-2.1Z',
  },
]

const EXPLORE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/rent', label: 'Rent' },
  { to: '/discover', label: 'Discover' },
  { to: '/about', label: 'About' },
]

const ACCOUNT_LINKS = [
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Sign up' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Footer() {
  return (
    <footer className="bg-forest text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex w-fit items-center text-lg font-bold text-white">
              <BrandLogo className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Verified rental homes across Cambodia — find a place that fits your life and your
              budget, with no hidden fees.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_ICONS.map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-sage hover:text-sage"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />

          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <li>Street 210, Phnom Penh, Cambodia</li>
              <li>hello@prs.com</li>
              <li>+855 12 345 678</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-white/60 sm:flex-row sm:px-6 lg:px-10">
          <p>&copy; {new Date().getFullYear()} PRS, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-sage hover:underline">Privacy</a>
            <a href="#" className="hover:text-sage hover:underline">Terms</a>
            <a href="#" className="hover:text-sage hover:underline">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <ul className="mt-4 flex flex-col gap-3 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-white/60 transition-colors hover:text-sage">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
