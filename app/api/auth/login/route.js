export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    await dbConnect()
    const { email, password } = await request.json()

    if (!email || !password) {
      return errorResponse('Email and password are required')
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) return errorResponse('Invalid email or password', 401)

    if (!user.isActive) return errorResponse('Account has been deactivated', 403)

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return errorResponse('Invalid email or password', 401)

    const token = signToken({ id: user._id, role: user.role })

    // Strip password
    const userObj = user.toJSON()

    const res = successResponse({ user: userObj, token, message: 'Login successful' })
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
