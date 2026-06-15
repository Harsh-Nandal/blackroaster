export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Review } from '@/models/index'
import Product from '@/models/Product'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function PUT(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const { isApproved } = await request.json()

    const review = await Review.findByIdAndUpdate(params.id, { isApproved }, { new: true })
      .populate('product', 'name slug')
      .populate('user', 'name email')
      .lean()

    if (!review) return notFound('Review')

    // Recalculate product rating
    const productId = review.product?._id || review.product
    if (productId) {
      const stats = await Review.aggregate([
        { $match: { product: productId, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      await Product.findByIdAndUpdate(productId, {
        rating: stats[0]?.avg || 0,
        reviewCount: stats[0]?.count || 0,
      })
    }

    return successResponse({ review })
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
    const review = await Review.findByIdAndDelete(params.id)
    if (!review) return notFound('Review')

    return successResponse({ message: 'Review deleted' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
