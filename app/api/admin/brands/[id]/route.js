export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Brand from '@/models/Brand'
import Product from '@/models/Product'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const brand = await Brand.findById(params.id).lean()
    if (!brand) return notFound('Brand')
    return successResponse({ brand })
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

    const brand = await Brand.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean()
    if (!brand) return notFound('Brand')
    return successResponse({ brand })
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

    const productCount = await Product.countDocuments({ brand: params.id })
    if (productCount > 0) {
      return errorResponse(`Cannot delete: ${productCount} product(s) use this brand`)
    }

    const brand = await Brand.findByIdAndDelete(params.id)
    if (!brand) return notFound('Brand')

    return successResponse({ message: 'Brand deleted successfully' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
