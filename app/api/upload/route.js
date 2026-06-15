export const dynamic = 'force-dynamic'

import { uploadImage } from '@/lib/cloudinary'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'luxwall'

    if (!file) return serverErrorResponse(new Error('No file provided'))

    const result = await uploadImage(file, folder)
    return successResponse({ url: result.url, publicId: result.publicId })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
