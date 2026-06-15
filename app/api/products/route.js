export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import '@/models/Category'
import '@/models/Brand'
import { successResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const skip = (page - 1) * limit

    const query = { isActive: true }

    // Filters
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    const newArrival = searchParams.get('newArrival')
    const bestSeller = searchParams.get('bestSeller')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const tags = searchParams.get('tags')

    if (category) query.category = category
    if (brand) query.brand = brand
    if (featured === 'true') query.isFeatured = true
    if (newArrival === 'true') query.isNewArrival = true
    if (bestSeller === 'true') query.isBestSeller = true
    if (search) query.$text = { $search: search }
    if (tags) query.tags = { $in: tags.split(',') }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sort
    let sortOption = { createdAt: -1 }
    const sort = searchParams.get('sort')
    if (sort === 'price_asc') sortOption = { price: 1 }
    else if (sort === 'price_desc') sortOption = { price: -1 }
    else if (sort === 'rating') sortOption = { rating: -1 }
    else if (sort === 'popular') sortOption = { soldCount: -1 }
    else if (sort === 'newest') sortOption = { createdAt: -1 }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('brand', 'name logo')
        .sort(sortOption)
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
    await dbConnect()
    const body = await request.json()

    // Auto-generate slug if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }

    const product = await Product.create(body)
    return successResponse({ product }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
