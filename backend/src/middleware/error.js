import { HttpError } from '../utils/httpError.js'

export function notFound(req, res, next) {
  next(new HttpError(404, 'Not found'))
}

export function errorHandler(err, req, res, next) {
  void next
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Already exists' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Not found' })
  }
  const status = err.status || 500
  const message = status === 500 ? 'Server error' : err.message || 'Request failed'
  if (status === 500) console.error(err)
  res.status(status).json({ message })
}
