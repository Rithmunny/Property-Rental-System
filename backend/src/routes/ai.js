import { Router } from 'express'
import { asyncHandler } from '../utils/httpError.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import * as ai from '../controllers/aiController.js'

const router = Router()

router.get('/status', asyncHandler(ai.status))
router.post('/search/parse', optionalAuth, asyncHandler(ai.parseSearch))
router.post('/generate-description', requireAuth, asyncHandler(ai.generateDescription))
router.get('/similar/:propertyId', optionalAuth, asyncHandler(ai.similar))
router.post('/chat', optionalAuth, asyncHandler(ai.chat))
router.post('/suggest-reply', requireAuth, asyncHandler(ai.suggestReply))

export default router
