import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Home as HomeIcon, Menu, X, Search, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TICKER_TEXT = 'SAVE UP TO 20% ON YOUR FIRST BOOKING'

const links = [
  { to: '/', label: 'Home' },
  { to: '/listings', label: 'Listings' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-forest' : 'text-gray-600 hover:text-forest'
    }`

  return (
    <div className="sticky top-0 z-50">
      <div className="overflow-hidden bg-forest py-2 text-white">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-medium tracking-wide">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              {TICKER_TEXT}
              <span className="h-1 w-1 rounded-full bg-sage" />
            </span>
          ))}
        </div>
      </div>

      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white">
              <HomeIcon className="h-4 w-4" />
            </span>
            PRS
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/listings"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-forest hover:text-forest"
            >
              <Search className="h-4 w-4" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full bg-forest py-2 pl-3 pr-4 text-sm font-medium text-white hover:bg-forest-dark"
                >
                  <User className="h-4 w-4" />
                  {user.name}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-forest">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark"
                >
                  Contact us
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {open && (
          <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 md:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="border-gray-200" />
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="text-left text-sm font-medium text-gray-700"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-medium text-forest" onClick={() => setOpen(false)}>
                  Contact us
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </div>
  )
}
