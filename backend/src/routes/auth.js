import { Router } from 'express'
import { asyncHandler } from '../utils/httpError.js'
import { requireAuth } from '../middleware/auth.js'
import * as auth from '../controllers/authController.js'

const router = Router()

router.post('/register', asyncHandler(auth.register))
router.post('/login', asyncHandler(auth.login))
router.post('/logout', requireAuth, asyncHandler(auth.logout))
router.get('/me', requireAuth, asyncHandler(auth.me))
router.patch('/profile', requireAuth, asyncHandler(auth.updateProfile))
router.post('/password', requireAuth, asyncHandler(auth.changePassword))

export default router
