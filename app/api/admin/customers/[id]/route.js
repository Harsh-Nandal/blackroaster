export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Order from '@/models/Order'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const user = await User.findById(params.id).select('-password -resetPasswordToken -resetPasswordExpire').lean()
    if (!user) return notFound('Customer')

    const orders = await Order.find({ user: params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)

    return successResponse({ customer: { ...user, orders, totalSpent } })
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function PUT(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const { isActive } = await request.json()

    const user = await User.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    ).select('-password').lean()

    if (!user) return notFound('Customer')
    return successResponse({ customer: user })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
