export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
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
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const query = { role: 'user' }
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false

    const [users, total] = await Promise.all([
      User.find(query).select('-password -resetPasswordToken -resetPasswordExpire').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ])

    // Attach order count to each user
    const userIds = users.map(u => u._id)
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ])
    const orderMap = {}
    orderCounts.forEach(o => { orderMap[o._id.toString()] = o })

    const enriched = users.map(u => ({
      ...u,
      orderCount: orderMap[u._id.toString()]?.count || 0,
      totalSpent: orderMap[u._id.toString()]?.total || 0,
    }))

    return paginatedResponse(enriched, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
