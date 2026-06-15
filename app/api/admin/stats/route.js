export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Product from '@/models/Product'
import Order from '@/models/Order'
import { Review, Contact } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, forbiddenResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalOrders,
      monthOrders,
      totalRevenue,
      monthRevenue,
      totalProducts,
      totalUsers,
      pendingReviews,
      newContacts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Review.countDocuments({ isApproved: false }),
      Contact.countDocuments({ status: 'new' }),
    ])

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean()

    // Revenue by month (last 6 months)
    const revenueChart = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    return successResponse({
      stats: {
        totalOrders,
        monthOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
        pendingReviews,
        newContacts,
      },
      recentOrders,
      revenueChart,
    })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
