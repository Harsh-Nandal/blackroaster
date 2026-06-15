export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'
import Product from '@/models/Product'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const category = await Category.findById(params.id).populate('parent', 'name slug').lean()
    if (!category) return notFound('Category')
    return successResponse({ category })
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

    const category = await Category.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
      .populate('parent', 'name slug')
      .lean()

    if (!category) return notFound('Category')
    return successResponse({ category })
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

    const productCount = await Product.countDocuments({ category: params.id })
    if (productCount > 0) {
      return errorResponse(`Cannot delete: ${productCount} product(s) use this category`)
    }

    const childCount = await Category.countDocuments({ parent: params.id })
    if (childCount > 0) {
      return errorResponse(`Cannot delete: ${childCount} sub-category(ies) exist under this category`)
    }

    const category = await Category.findByIdAndDelete(params.id)
    if (!category) return notFound('Category')

    return successResponse({ message: 'Category deleted successfully' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
