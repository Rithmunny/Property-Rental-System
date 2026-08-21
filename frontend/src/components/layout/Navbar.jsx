import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Search, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import RentMegaMenu, { RentNavTrigger, RentMobileAccordion } from './RentMegaMenu'
import BrandLogo from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TICKER_TEXT = 'Verified rental homes across Cambodia — find your next place today'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [rentOpen, setRentOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const rentTriggerRef = useRef(null)
  const rentMenuRef = useRef(null)
  const rentActive = location.pathname.startsWith('/rent') || location.pathname.startsWith('/listings')

  useEffect(() => {
    setRentOpen(false)
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!rentOpen) return
    const onPointer = (e) => {
      if (rentTriggerRef.current?.contains(e.target)) return
      if (rentMenuRef.current?.contains(e.target)) return
      setRentOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setRentOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
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

      <header className="relative border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center text-lg font-bold text-gray-900">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <div ref={rentTriggerRef}>
              <RentNavTrigger
                open={rentOpen}
                isActive={rentActive}
                onToggle={() => setRentOpen((v) => !v)}
              />
            </div>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/discover" className={linkClass}>
              Discover
            </NavLink>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="outline" size="icon" aria-label="Search rentals">
              <Link to="/rent">
                <Search />
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="px-4">
                    <User />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="lg" className="px-5">
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {rentOpen && (
          <div
            ref={rentMenuRef}
            className="absolute inset-x-0 top-full z-50 hidden md:block"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
              <RentMegaMenu onNavigate={() => setRentOpen(false)} />
            </div>
          </div>
        )}

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
