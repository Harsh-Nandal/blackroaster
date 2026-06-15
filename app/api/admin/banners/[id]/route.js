export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Banner } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const banner = await Banner.findById(params.id).lean()
    if (!banner) return notFound('Banner')
    return successResponse({ banner })
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

    const banner = await Banner.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean()
    if (!banner) return notFound('Banner')
    return successResponse({ banner })
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
    const banner = await Banner.findByIdAndDelete(params.id)
    if (!banner) return notFound('Banner')
    return successResponse({ message: 'Banner deleted' })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
