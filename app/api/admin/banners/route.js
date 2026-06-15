export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Banner } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')

    const query = {}
    if (position) query.position = position

    const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 }).lean()
    return successResponse({ banners })
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

    const banner = await Banner.create(body)
    return successResponse({ banner }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
