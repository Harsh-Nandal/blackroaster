import dbConnect from '@/lib/dbConnect'
import { Settings } from '@/models/index'

/**
 * Returns the next unique order number such as "LW-00042".
 *
 * Uses a MongoDB atomic findOneAndUpdate with $inc so concurrent requests
 * can never receive the same number — no race condition possible.
 */
export async function generateOrderNumber() {
  await dbConnect()

  const counter = await Settings.findOneAndUpdate(
    { key: 'orderCounter' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  )

  const num = typeof counter.value === 'number' ? counter.value : 1
  return `LW-${String(num).padStart(5, '0')}`
}
