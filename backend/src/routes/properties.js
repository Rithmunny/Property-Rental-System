import { Router } from 'express'
import { asyncHandler } from '../utils/httpError.js'
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js'
import * as properties from '../controllers/propertyController.js'

const router = Router()

router.get('/', optionalAuth, asyncHandler(properties.list))
// Keep above '/:id' so "recommendations" is not treated as an id.
router.get('/recommendations', optionalAuth, asyncHandler(properties.recommendations))
router.get('/:id', optionalAuth, asyncHandler(properties.get))
router.post('/', requireAuth, requireRole('landlord'), asyncHandler(properties.create))
router.put('/:id', requireAuth, requireRole('landlord', 'admin'), asyncHandler(properties.update))
router.delete('/:id', requireAuth, requireRole('landlord', 'admin'), asyncHandler(properties.remove))

export default router
