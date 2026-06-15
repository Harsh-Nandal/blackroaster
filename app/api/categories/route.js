export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'
import { successResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function GET() {
  try {
    await dbConnect()
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean()
    return successResponse({ data: categories })
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    const category = await Category.create(body)
    return successResponse({ category }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
