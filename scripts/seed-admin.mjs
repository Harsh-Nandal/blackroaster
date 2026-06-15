/**
 * Admin seeder — run once to create the initial admin account.
 *
 *   node scripts/seed-admin.mjs
 *
 * Override defaults with environment variables (or edit DEFAULTS below):
 *   ADMIN_NAME="Admin"  ADMIN_EMAIL="you@example.com"  ADMIN_PASSWORD="Str0ng!" \
 *     node scripts/seed-admin.mjs
 *
 * The script is idempotent: running it again when the email already exists is safe.
 * Delete or keep this file — it only creates if the account is missing.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── 1. Load .env.local without requiring dotenv ───────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

try {
  const raw = readFileSync(resolve(ROOT, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    // Strip surrounding quotes if any; don't overwrite values already in env
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    if (process.env[key] === undefined) process.env[key] = val
  }
} catch {
  // .env.local not present — rely on environment variables already set
}

// ── 2. Validate required env ──────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('\n❌  MONGODB_URI is not set. Add it to .env.local or export it before running.\n')
  process.exit(1)
}

// Configurable defaults — override with env vars at call-time if needed
const DEFAULTS = {
  name:     process.env.ADMIN_NAME     || 'Admin',
  email:    process.env.ADMIN_EMAIL    || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
}

// ── 3. Connect to MongoDB and run seed ───────────────────────────────────────
import mongoose from 'mongoose'

// Import User model directly (no @/ aliases inside models/User.js)
import User from '../models/User.js'

async function seed() {
  console.log('\n🔌  Connecting to MongoDB…')
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    bufferCommands: false,
  })
  console.log('✅  Connected.\n')

  const existing = await User.findOne({ email: DEFAULTS.email.toLowerCase() })

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`ℹ️   Admin already exists: ${existing.email}  (role: ${existing.role})`)
      console.log('    No changes made.\n')
    } else {
      // Upgrade an existing user account to admin
      existing.role = 'admin'
      existing.isVerified = true
      existing.isActive = true
      await existing.save()
      console.log(`⬆️   Upgraded existing account to admin: ${existing.email}\n`)
    }
    return
  }

  // Password is hashed by the UserSchema pre-save hook — do NOT hash it here
  const admin = await User.create({
    name:       DEFAULTS.name,
    email:      DEFAULTS.email,
    password:   DEFAULTS.password,   // will be hashed by pre-save middleware
    role:       'admin',
    isVerified: true,
    isActive:   true,
  })

  console.log('🎉  Admin account created!')
  console.log(`    Name    : ${admin.name}`)
  console.log(`    Email   : ${admin.email}`)
  console.log(`    Role    : ${admin.role}`)
  console.log(`    ID      : ${admin._id}\n`)
  console.log('    You can now log in at /auth/login with the credentials above.')
  console.log('    Change the password immediately after first login.\n')
}

seed()
  .catch(err => {
    console.error('\n❌  Seed failed:', err.message, '\n')
    process.exit(1)
  })
  .finally(() => mongoose.disconnect())
