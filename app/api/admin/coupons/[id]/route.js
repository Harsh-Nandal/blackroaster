export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Coupon } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const coupon = await Coupon.findById(params.id).lean()
    if (!coupon) return notFound('Coupon')
    return successResponse({ coupon })
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
    const body = await request.json()
    delete body.code // code cannot be changed

    const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean()
    if (!coupon) return notFound('Coupon')
    return successResponse({ coupon })
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const coupon = await Coupon.findByIdAndDelete(params.id)
    if (!coupon) return notFound('Coupon')
    return successResponse({ message: 'Coupon deleted' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
