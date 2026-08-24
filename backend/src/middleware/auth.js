import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { isAdmin } from '../utils/roles.js'

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

function readBearer(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

async function userFromToken(token) {
  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }
  const id = Number(payload.sub)
  if (!id) throw new HttpError(401, 'Invalid token')
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new HttpError(401, 'Not authenticated')
  return user
}

export function requireAuth(req, res, next) {
  const token = readBearer(req)
  if (!token) return next(new HttpError(401, 'Not authenticated'))
  userFromToken(token)
    .then((user) => {
      req.user = user
      next()
    })
    .catch(next)
}

export function optionalAuth(req, res, next) {
  const token = readBearer(req)
  if (!token) return next()
  userFromToken(token)
    .then((user) => {
      req.user = user
      next()
    })
    .catch(() => next())
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Not authenticated'))
    const allowed = roles.includes(req.user.role) || (roles.includes('admin') && isAdmin(req.user.role))
    if (!allowed) {
      return next(new HttpError(403, 'You do not have permission to do that'))
    }
    next()
  }
}

export function assertNotSuspended(user) {
  if (user?.role === 'landlord' && user.status === 'suspended') {
    throw new HttpError(403, 'Your landlord account is suspended')
  }
}
