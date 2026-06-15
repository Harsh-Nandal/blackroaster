import { NextResponse } from 'next/server'

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

export function notFound(entity = 'Resource') {
  return errorResponse(`${entity} not found`, 404)
}

export function unauthorizedResponse() {
  return errorResponse('Not authorized', 401)
}

export function forbiddenResponse() {
  return errorResponse('Access forbidden', 403)
}

export function serverErrorResponse(err) {
  console.error('API Error:', err)
  return errorResponse(
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500
  )
}

export function paginatedResponse(data, total, page, limit) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  })
}
