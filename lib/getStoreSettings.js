import dbConnect from '@/lib/dbConnect'
import { Settings } from '@/models/index'

// Fetches only the commerce settings needed for order calculations.
// Returns numbers with safe defaults so callers don't need to guard.
export async function getStoreSettings() {
  await dbConnect()
  const rows = await Settings.find({
    key: { $in: ['shippingCharge', 'freeShippingThreshold', 'taxRate'] },
  }).lean()

  const map = {}
  rows.forEach(r => { map[r.key] = r.value })

  return {
    shippingCharge: Number(map.shippingCharge ?? 99),
    freeShippingThreshold: Number(map.freeShippingThreshold ?? 999),
    taxRate: Number(map.taxRate ?? 0),        // percentage, e.g. 18 means 18%
  }
}
