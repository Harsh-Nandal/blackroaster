export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Brand from '@/models/Brand'
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
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit
    const search = searchParams.get('search')
    const all = searchParams.get('all') === 'true'

    const query = {}
    if (search) query.name = { $regex: search, $options: 'i' }

    if (all) {
      const brands = await Brand.find(query).sort({ name: 1 }).lean()
      return successResponse({ brands })
    }

    const [brands, total] = await Promise.all([
      Brand.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Brand.countDocuments(query),
    ])

    return paginatedResponse(brands, total, page, limit)
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

    const existing = await Brand.findOne({ slug: body.slug })
    if (existing) return errorResponse('A brand with this name/slug already exists')

    const brand = await Brand.create(body)
    return successResponse({ brand }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
