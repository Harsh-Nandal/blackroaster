export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()

    await dbConnect()
    const user = await User.findById(decoded.id).populate('wishlist', 'name slug images price salePrice')
    if (!user) return errorResponse('User not found', 404)

    return successResponse({ user })
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function PUT(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()

    await dbConnect()
    const { name, phone, avatar } = await request.json()

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    )

    return successResponse({ user, message: 'Profile updated successfully' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
