/**
 * One-time admin seeder API route.
 *
 * SETUP:
 *   1. Add  ADMIN_SEED_SECRET=some-long-random-string  to .env.local
 *   2. Call POST /api/admin/seed  with header  x-seed-secret: <your-secret>
 *   3. After the admin is created, REMOVE this file (or remove ADMIN_SEED_SECRET
 *      from .env.local) so it cannot be called again.
 *
 * This route deliberately does NOT use the standard auth middleware so it can
 * bootstrap the very first admin before any JWT exists.
 */

export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse'

const SEED_SECRET = process.env.ADMIN_SEED_SECRET

export async function POST(request) {
  // ── Guard 1: secret must be configured ──────────────────────────────────────
  if (!SEED_SECRET) {
    return errorResponse(
      'ADMIN_SEED_SECRET is not configured. Add it to .env.local before using this endpoint.',
      503,
    )
  }

  // ── Guard 2: caller must supply the secret ───────────────────────────────────
  const supplied = request.headers.get('x-seed-secret')
  if (!supplied || supplied !== SEED_SECRET) {
    // Return 404 so the route does not advertise its existence to unauthorised callers
    return errorResponse('Not found', 404)
  }

  try {
    await dbConnect()

    const body = await request.json().catch(() => ({}))

    const name     = body.name     || process.env.ADMIN_NAME     || 'Admin'
    const email    = body.email    || process.env.ADMIN_EMAIL    || 'admin@example.com'
    const password = body.password || process.env.ADMIN_PASSWORD || 'Admin@123'

    const existing = await User.findOne({ email: email.toLowerCase() })

    if (existing) {
      if (existing.role === 'admin') {
        return successResponse({
          message: 'Admin already exists — no changes made.',
          email: existing.email,
          alreadyAdmin: true,
        })
      }

      // Promote an existing regular user to admin
      existing.role = 'admin'
      existing.isVerified = true
      existing.isActive = true
      await existing.save()

      return successResponse({
        message: 'Existing account promoted to admin.',
        email: existing.email,
        id: existing._id,
      })
    }

    // Password is intentionally passed in plaintext — the UserSchema pre-save
    // hook (bcrypt, rounds=12) hashes it before writing to MongoDB.
    const admin = await User.create({
      name,
      email,
      password,   // hashed by pre-save middleware, NOT here
      role:       'admin',
      isVerified: true,
      isActive:   true,
    })

    return successResponse(
      {
        message:  'Admin account created successfully.',
        name:     admin.name,
        email:    admin.email,
        role:     admin.role,
        id:       admin._id,
        warning:  'Remove this route (or ADMIN_SEED_SECRET from .env.local) now that seeding is done.',
      },
      201,
    )
  } catch (err) {
    return serverErrorResponse(err)
  }
}

// Explicitly block GET/PUT/DELETE — only POST is allowed
export function GET()    { return errorResponse('Not found', 404) }
export function PUT()    { return errorResponse('Not found', 404) }
export function DELETE() { return errorResponse('Not found', 404) }
