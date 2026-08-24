import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X, Search, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import RentMegaMenu, { RentNavTrigger, RentMobileAccordion } from './RentMegaMenu'
import BrandLogo from '@/components/common/BrandLogo'
import ThemeToggle from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TICKER_TEXT = 'Verified rental homes across Cambodia — find your next place today'

const panelEase = [0.22, 1, 0.36, 1]

const menuStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
}

const menuItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: panelEase } },
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [rentOpen, setRentOpen] = useState(false)
  const reduceMotion = useReducedMotion()
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
      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
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

      <header className="relative border-b border-border bg-background">
        <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="col-start-1 justify-self-start text-lg font-bold text-foreground">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          <div className="col-start-2 hidden items-center justify-center gap-8 md:flex">
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

          <div className="col-start-3 flex items-center justify-end justify-self-end gap-3">
            <ThemeToggle />
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

            <button
              className="relative flex h-9 w-9 items-center justify-center text-foreground md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? 'close' : 'open'}
                  initial={reduceMotion ? false : { opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.18, ease: panelEase }}
                  className="absolute"
                >
                  {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {rentOpen && (
            <motion.div
              ref={rentMenuRef}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: panelEase }}
              className="absolute inset-x-0 top-full z-50 hidden md:block"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                <RentMegaMenu onNavigate={() => setRentOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: panelEase }}
              className="overflow-hidden md:hidden"
            >
              <motion.div
                variants={menuStagger}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-4 border-t border-border bg-background px-4 py-4"
              >
                <motion.div variants={menuItem}>
                  <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
                    Home
                  </NavLink>
                </motion.div>
                <motion.div variants={menuItem}>
                  <Link to="/rent" className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                    Rent
                  </Link>
                </motion.div>
                <motion.div variants={menuItem}>
                  <RentMobileAccordion onNavigate={() => setOpen(false)} />
                </motion.div>
                <motion.div variants={menuItem}>
                  <NavLink to="/about" className={linkClass} onClick={() => setOpen(false)}>
                    About
                  </NavLink>
                </motion.div>
                <motion.div variants={menuItem}>
                  <NavLink to="/discover" className={linkClass} onClick={() => setOpen(false)}>
                    Discover
                  </NavLink>
                </motion.div>
                <motion.hr variants={menuItem} className="border-border" />
                {user ? (
                  <>
                    <motion.div variants={menuItem}>
                      <Link to="/dashboard" className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItem}>
                      <button
                        onClick={() => {
                          logout()
                          setOpen(false)
                        }}
                        className="text-left text-sm font-medium text-foreground"
                      >
                        Log out
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={menuItem}>
                      <Link to="/login" className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                        Log in
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItem}>
                      <Link to="/register" className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                        Sign up
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  )
}
