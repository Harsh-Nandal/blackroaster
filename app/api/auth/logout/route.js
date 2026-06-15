export const dynamic = 'force-dynamic'

// app/api/auth/logout/route.js
import { successResponse } from '@/lib/apiResponse'
import { NextResponse } from 'next/server'

export async function POST() {
  const res = successResponse({ message: 'Logged out successfully' })
  res.cookies.set('lw_token', '', { httpOnly: true, maxAge: 0, path: '/' })
  return res
}
