import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import RequireRole from './components/common/RequireRole'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LandlordLayout from './pages/dashboard/landlord/LandlordLayout'
import LandlordOverview from './pages/dashboard/landlord/Overview'
import LandlordListings from './pages/dashboard/landlord/Listings'
import LandlordContracts from './pages/dashboard/landlord/Contracts'
import LandlordRequests from './pages/dashboard/landlord/Requests'
import LandlordPayments from './pages/dashboard/landlord/Payments'
import LandlordTenants from './pages/dashboard/landlord/Tenants'
import TenantLayout from './pages/dashboard/tenant/TenantLayout'
import TenantOverview from './pages/dashboard/tenant/Overview'
import TenantMyRental from './pages/dashboard/tenant/MyRental'
import TenantPayments from './pages/dashboard/tenant/Payments'
import TenantRequests from './pages/dashboard/tenant/Requests'
import TenantSavedHomes from './pages/dashboard/tenant/SavedHomes'
import AdminLayout from './pages/dashboard/admin/AdminLayout'
import AdminOverview from './pages/dashboard/admin/Overview'
import AdminLandlords from './pages/dashboard/admin/Landlords'
import AdminTenants from './pages/dashboard/admin/Tenants'
import AdminProperties from './pages/dashboard/admin/Properties'
import AdminPayments from './pages/dashboard/admin/Payments'
import About from './pages/About'
import NotFound from './pages/NotFound'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/dashboard/landlord"
        element={
          <RequireRole role="landlord">
            <LandlordLayout />
          </RequireRole>
        }
      >
        <Route index element={<LandlordOverview />} />
        <Route path="listings" element={<LandlordListings />} />
        <Route path="contracts" element={<LandlordContracts />} />
        <Route path="requests" element={<LandlordRequests />} />
        <Route path="payments" element={<LandlordPayments />} />
        <Route path="tenants" element={<LandlordTenants />} />
      </Route>

      <Route
        path="/dashboard/tenant"
        element={
          <RequireRole role="tenant">
            <TenantLayout />
          </RequireRole>
        }
      >
        <Route index element={<TenantOverview />} />
        <Route path="my-rental" element={<TenantMyRental />} />
        <Route path="payments" element={<TenantPayments />} />
        <Route path="requests" element={<TenantRequests />} />
        <Route path="saved" element={<TenantSavedHomes />} />
      </Route>

      <Route
        path="/dashboard/admin"
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="landlords" element={<AdminLandlords />} />
        <Route path="tenants" element={<AdminTenants />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>
    </Routes>
  )
}
