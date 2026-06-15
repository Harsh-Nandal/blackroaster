export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    await dbConnect()
    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required')
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters')
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return errorResponse('An account with this email already exists', 409)
    }

    const user = await User.create({ name, email, phone, password })
    const token = signToken({ id: user._id, role: user.role })

    const res = successResponse({ user, token, message: 'Account created successfully' }, 201)
    res.cookies.set('lw_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (err) {
    return serverErrorResponse(err)
  }
}
