export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Contact } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, notFound, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request, { params }) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const contact = await Contact.findById(params.id).lean()
    if (!contact) return notFound('Contact')
    return successResponse({ contact })
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
    const { status, adminNote } = await request.json()

    const contact = await Contact.findByIdAndUpdate(
      params.id,
      { status, adminNote },
      { new: true }
    ).lean()

    if (!contact) return notFound('Contact')
    return successResponse({ contact })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
