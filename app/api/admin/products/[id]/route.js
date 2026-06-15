export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import '@/models/Category'
import '@/models/Brand'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const product = await Product.findById(params.id)
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
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const body = await request.json()

    if (body.name && !body.slug) {
      const existing = await Product.findById(params.id).select('slug').lean()
      if (!existing?.slug) {
        body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }
    }

    // For variable products: sync product.price/salePrice from the default variant
    if (body.type === 'variable' && Array.isArray(body.variants) && body.variants.length > 0) {
      const dv = body.variants.find(v => v.isDefault) || body.variants[0]
      body.price = Number(dv.price) || 0
      const sp = Number(dv.salePrice)
      body.salePrice = (dv.salePrice && !isNaN(sp) && sp > 0 && sp < body.price) ? sp : null
    }

    const product = await Product.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .lean()

    if (!product) return notFound('Product')
    return successResponse({ product })
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
    const product = await Product.findByIdAndDelete(params.id)
    if (!product) return notFound('Product')

    return successResponse({ message: 'Product deleted successfully' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
