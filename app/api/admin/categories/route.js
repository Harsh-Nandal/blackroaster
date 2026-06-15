export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit
    const search = searchParams.get('search')
    const all = searchParams.get('all') === 'true'

    const query = {}
    if (search) query.name = { $regex: search, $options: 'i' }

    if (all) {
      const categories = await Category.find(query).populate('parent', 'name slug').sort({ displayOrder: 1, name: 1 }).lean()
      return successResponse({ categories })
    }

    const [categories, total] = await Promise.all([
      Category.find(query).populate('parent', 'name slug').sort({ displayOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments(query),
    ])

    return paginatedResponse(categories, total, page, limit)
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

    const existing = await Category.findOne({ slug: body.slug })
    if (existing) return errorResponse('A category with this name/slug already exists')

    const category = await Category.create(body)
    const populated = await Category.findById(category._id).populate('parent', 'name slug').lean()
    return successResponse({ category: populated }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
