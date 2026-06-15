export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Settings } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const settings = await Settings.find().lean()

    // Convert to key-value map for convenience
    const map = {}
    settings.forEach(s => { map[s.key] = s.value })
    return successResponse({ settings: map, raw: settings })
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
    const { settings } = await request.json() // array of { key, value, group }

    const ops = settings.map(({ key, value, group }) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value, group: group || 'general' } },
        upsert: true,
      },
    }))

    await Settings.bulkWrite(ops)

    const updated = await Settings.find().lean()
    const map = {}
    updated.forEach(s => { map[s.key] = s.value })

    return successResponse({ settings: map })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
