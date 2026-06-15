export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Newsletter } from '@/models/index'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    await dbConnect()
    const { email } = await request.json()

    if (!email) return errorResponse('Email is required')

    const existing = await Newsletter.findOne({ email: email.toLowerCase() })
    if (existing) return errorResponse('This email is already subscribed')

    await Newsletter.create({ email })
    return successResponse({ message: 'Subscribed successfully. Welcome to BlackRoaster!' }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
