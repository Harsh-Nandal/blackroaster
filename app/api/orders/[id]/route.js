export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()

    await dbConnect()
    const order = await Order.findOne({ _id: params.id, user: decoded.id }).lean()

    if (!order) return notFound('Order')

    return successResponse({ order })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
