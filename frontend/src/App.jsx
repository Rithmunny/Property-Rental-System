import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout'
import { RequireRole } from '@/components/common'
import {
  About,
  DashboardRedirect,
  Discover,
  Home,
  Login,
  NotFound,
  PropertyDetail,
  Register,
  Rent,
} from '@/pages'
import {
  AdminLandlords,
  AdminLayout,
  AdminOverview,
  AdminPayments,
  AdminProperties,
  AdminTenants,
  LandlordContracts,
  LandlordLayout,
  LandlordListings,
  LandlordMessages,
  LandlordOverview,
  LandlordPayments,
  LandlordRequests,
  LandlordSheet,
  LandlordTenants,
  Settings,
  TenantAlerts,
  TenantLayout,
  TenantMessages,
  TenantMyRental,
  TenantOverview,
  TenantPayments,
  TenantRequests,
  TenantSavedHomes,
} from '@/pages/dashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="/listings" element={<Navigate to="/rent" replace />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/discover" element={<Discover />} />
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
        <Route path="messages" element={<LandlordMessages />} />
        <Route path="payments" element={<LandlordPayments />} />
        <Route path="sheet" element={<LandlordSheet />} />
        <Route path="tenants" element={<LandlordTenants />} />
        <Route path="settings" element={<Settings />} />
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
        <Route path="messages" element={<TenantMessages />} />
        <Route path="alerts" element={<TenantAlerts />} />
        <Route path="saved" element={<TenantSavedHomes />} />
        <Route path="settings" element={<Settings />} />
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
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
