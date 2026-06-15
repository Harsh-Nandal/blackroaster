export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Contact } from '@/models/index'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    await dbConnect()
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !message) {
      return errorResponse('Name, email, and message are required')
    }

    const contact = await Contact.create({ name, email, phone, subject, message })
    return successResponse({ contact, message: 'Message sent successfully. We will get back to you soon.' }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
