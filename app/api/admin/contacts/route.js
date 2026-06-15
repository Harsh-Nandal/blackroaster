export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Contact } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

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
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const query = {}
    if (status) query.status = status
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ]

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(query),
    ])

    return paginatedResponse(contacts, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
