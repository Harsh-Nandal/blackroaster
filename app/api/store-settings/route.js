export const dynamic = 'force-dynamic'

import { getStoreSettings } from '@/lib/getStoreSettings'
import { successResponse, serverErrorResponse } from '@/lib/apiResponse'

// Public endpoint — returns only the commerce settings needed by the frontend
export async function GET() {
  try {
    const settings = await getStoreSettings()
    return successResponse({ settings })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
