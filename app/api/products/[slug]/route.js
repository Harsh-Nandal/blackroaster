export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import '@/models/Category'
import '@/models/Brand'
import { successResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const product = await Product.findOne({ slug: params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .lean()

    if (!product) return notFound('Product')
    return successResponse({ product })
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    const body = await request.json()
    const product = await Product.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true, runValidators: true }
    )
    if (!product) return notFound('Product')
    return successResponse({ product })
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const product = await Product.findOneAndUpdate(
      { slug: params.slug },
      { isActive: false },
      { new: true }
    )
    if (!product) return notFound('Product')
    return successResponse({ message: 'Product deleted successfully' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
