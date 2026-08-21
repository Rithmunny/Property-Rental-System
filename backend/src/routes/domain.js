import { Router } from 'express'
import { asyncHandler } from '../utils/httpError.js'
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js'
import {
  reviews,
  requests,
  rentals,
  saved,
  savedSearches,
  payments,
  messages,
  admin,
} from '../controllers/domainController.js'
import * as auth from '../controllers/authController.js'

export const reviewRoutes = Router()
reviewRoutes.get('/', optionalAuth, asyncHandler(reviews.list))
reviewRoutes.post('/', requireAuth, requireRole('tenant'), asyncHandler(reviews.create))

export const requestRoutes = Router()
requestRoutes.post('/', requireAuth, requireRole('tenant'), asyncHandler(requests.create))
requestRoutes.get('/mine', requireAuth, requireRole('tenant'), asyncHandler(requests.mine))
requestRoutes.get('/inbox', requireAuth, requireRole('landlord'), asyncHandler(requests.inbox))
requestRoutes.patch('/:id', requireAuth, requireRole('landlord', 'admin'), asyncHandler(requests.update))

export const rentalRoutes = Router()
rentalRoutes.get('/current', requireAuth, asyncHandler(rentals.current))

export const contractRoutes = Router()
contractRoutes.get('/', requireAuth, requireRole('landlord', 'admin'), asyncHandler(rentals.listContracts))
contractRoutes.post('/', requireAuth, requireRole('landlord', 'admin'), asyncHandler(rentals.createContract))

export const savedRoutes = Router()
savedRoutes.get('/', requireAuth, asyncHandler(saved.list))
savedRoutes.post('/:propertyId', requireAuth, asyncHandler(saved.toggle))
savedRoutes.get('/:propertyId', requireAuth, asyncHandler(saved.isSaved))

export const savedSearchRoutes = Router()
savedSearchRoutes.get('/', requireAuth, asyncHandler(savedSearches.list))
savedSearchRoutes.post('/', requireAuth, requireRole('tenant'), asyncHandler(savedSearches.create))
savedSearchRoutes.delete('/:id', requireAuth, asyncHandler(savedSearches.remove))
savedSearchRoutes.patch('/:id/seen', requireAuth, asyncHandler(savedSearches.markSeen))

export const paymentRoutes = Router()
paymentRoutes.get('/', requireAuth, asyncHandler(payments.get))
paymentRoutes.post('/mark-paid', requireAuth, requireRole('tenant'), asyncHandler(payments.markPaid))

export const messageRoutes = Router()
messageRoutes.get('/', requireAuth, asyncHandler(messages.list))
messageRoutes.post('/', requireAuth, asyncHandler(messages.send))

export const settingsRoutes = Router()
settingsRoutes.get('/', requireAuth, asyncHandler(auth.getSettings))
settingsRoutes.put('/', requireAuth, asyncHandler(auth.saveSettings))

export const adminRoutes = Router()
adminRoutes.get('/landlords', requireAuth, requireRole('admin'), asyncHandler(admin.landlords))
adminRoutes.get('/tenants', requireAuth, requireRole('admin'), asyncHandler(admin.tenants))
adminRoutes.patch('/landlords/:id', requireAuth, requireRole('admin'), asyncHandler(admin.updateLandlord))
