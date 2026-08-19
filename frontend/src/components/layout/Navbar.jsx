import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Search, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import RentMegaMenu, { RentNavTrigger, RentMobileAccordion } from './RentMegaMenu'
import BrandLogo from '@/components/common/BrandLogo'

const TICKER_TEXT = 'Verified rental homes across Cambodia — find your next place today'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [rentOpen, setRentOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const rentRef = useRef(null)
  const rentActive = location.pathname.startsWith('/rent') || location.pathname.startsWith('/listings')

  useEffect(() => {
    setRentOpen(false)
    setOpen(false)
    setMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!rentOpen) return
    const onPointer = (e) => {
      if (rentRef.current && !rentRef.current.contains(e.target)) setRentOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [rentOpen])

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
          <Link to="/" className="flex items-center text-lg font-bold text-gray-900">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <div className="relative" ref={rentRef}>
              <RentNavTrigger
                open={rentOpen}
                isActive={rentActive}
                onToggle={() => setRentOpen((v) => !v)}
              />
              {rentOpen && <RentMegaMenu onNavigate={() => setRentOpen(false)} />}
            </div>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/discover" className={linkClass}>
              Discover
            </NavLink>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/rent"
              aria-label="Search rentals"
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
                  Sign up
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
            <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <Link to="/rent" className="text-sm font-medium text-forest" onClick={() => setOpen(false)}>
              Rent
            </Link>
            <RentMobileAccordion onNavigate={() => setOpen(false)} />
            <NavLink to="/about" className={linkClass} onClick={() => setOpen(false)}>
              About
            </NavLink>
            <NavLink to="/discover" className={linkClass} onClick={() => setOpen(false)}>
              Discover
            </NavLink>
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
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </div>
  )
}
