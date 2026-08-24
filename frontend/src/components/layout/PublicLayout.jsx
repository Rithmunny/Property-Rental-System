import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import RentalAssistant from '@/components/common/RentalAssistant'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <RentalAssistant />
    </div>
  )
}
