export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import '@/models/Category'
import '@/models/Brand'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

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
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')

    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ]
    if (category) query.category = category
    if (brand) query.brand = brand
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false
    if (featured === 'true') query.isFeatured = true

    const sort = searchParams.get('sort') || '-createdAt'
    const sortObj = sort.startsWith('-')
      ? { [sort.slice(1)]: -1 }
      : { [sort]: 1 }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('brand', 'name logo')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return paginatedResponse(products, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function POST(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const body = await request.json()

    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    if (!body.sku && body.name) {
      body.sku = `SKU-${Date.now()}`
    }

    // For variable products: sync product.price/salePrice from the default variant
    // so ProductCard and listings can show correct prices without reading variants[]
    if (body.type === 'variable' && Array.isArray(body.variants) && body.variants.length > 0) {
      const dv = body.variants.find(v => v.isDefault) || body.variants[0]
      body.price = Number(dv.price) || 0
      const sp = Number(dv.salePrice)
      body.salePrice = (dv.salePrice && !isNaN(sp) && sp > 0 && sp < body.price) ? sp : null
    }

    const product = await Product.create(body)
    const populated = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .lean()

    return successResponse({ product: populated }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
