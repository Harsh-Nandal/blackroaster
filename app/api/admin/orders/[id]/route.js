export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const order = await Order.findById(params.id)
      .populate('user', 'name email phone addresses')
      .populate('items.product', 'name slug thumbnail')
      .lean()

    if (!order) return notFound('Order')
    return successResponse({ order })
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
    const { status, paymentStatus, tracking, notes, cancelReason } = await request.json()

    const order = await Order.findById(params.id)
    if (!order) return notFound('Order')

    if (status && status !== order.status) {
      order.statusHistory.push({ status, note: notes || '', timestamp: new Date() })
      order.status = status
    }
    if (paymentStatus) order.paymentStatus = paymentStatus
    if (tracking) order.tracking = { ...order.tracking, ...tracking }
    if (notes) order.notes = notes
    if (cancelReason) order.cancelReason = cancelReason

    await order.save()

    const updated = await Order.findById(params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug thumbnail')
      .lean()

    return successResponse({ order: updated })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
