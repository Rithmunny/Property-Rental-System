import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import propertyRoutes from './routes/properties.js'
import {
  reviewRoutes,
  requestRoutes,
  rentalRoutes,
  contractRoutes,
  savedRoutes,
  savedSearchRoutes,
  paymentRoutes,
  messageRoutes,
  settingsRoutes,
  adminRoutes,
} from './routes/domain.js'

const app = express()

app.use(
  cors({
    origin: [env.frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
)
app.use(express.json({ limit: '8mb' }))

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'PRS API' })
})
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/rentals', rentalRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/saved-searches', savedSearchRoutes)
app.use('/api/saved', savedRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
