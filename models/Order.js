import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { label: String, sku: String },
})

const AddressSnapshot = new mongoose.Schema({
  name: String, phone: String,
  line1: String, line2: String,
  city: String, state: String,
  pincode: String, country: String,
})

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [OrderItemSchema],

    shippingAddress: AddressSnapshot,

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },

    coupon: { code: String, discount: Number },

    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'upi', 'card', 'netbanking'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: String,

    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
    },

    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
    },

    statusHistory: [
      {
        status: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    notes: String,
    cancelReason: String,
  },
  { timestamps: true }
)

OrderSchema.index({ user: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })

// Auto-generate order number (fallback — routes should set this before calling save/create)
// Mongoose 8: async pre-hooks must NOT call next(); the returned Promise is the completion signal.
OrderSchema.pre('save', async function () {
  if (!this.isNew || this.orderNumber) return

  // Atomic counter — no race condition under concurrent requests
  const Settings = mongoose.models.Settings
  if (Settings) {
    const counter = await Settings.findOneAndUpdate(
      { key: 'orderCounter' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    )
    const num = typeof counter?.value === 'number' ? counter.value : Date.now()
    this.orderNumber = `LW-${String(num).padStart(5, '0')}`
  } else {
    // Ultimate fallback: timestamp + random to avoid blocking a failing Settings model
    this.orderNumber = `LW-${Date.now().toString(36).toUpperCase()}`
  }
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
