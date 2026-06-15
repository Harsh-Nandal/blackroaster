import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
const COOKIE_NAME = 'lw_token'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  })
}

export function clearAuthCookie(res) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
}

export function getTokenFromRequest(request) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // Fall back to cookie
  const cookieStore = cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

export async function getAuthUser(request) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded) return null
  return decoded
}
