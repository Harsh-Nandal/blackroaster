export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'
import { getAuthUser } from '@/lib/auth'
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    const query = {}
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (status) query.status = status
    if (paymentStatus) query.paymentStatus = paymentStatus
    if (from || to) {
      query.createdAt = {}
      if (from) query.createdAt.$gte = new Date(from)
      if (to) query.createdAt.$lte = new Date(to)
    }
    if (search) query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
    ]

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ])

    return paginatedResponse(orders, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
