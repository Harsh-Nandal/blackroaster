import mongoose from 'mongoose'

// ── Review ────────────────────────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
)
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })
ReviewSchema.index({ product: 1, isApproved: 1 })

export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)

// ── Coupon ────────────────────────────────────────────────────────────────────
const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    userLimit: { type: Number, default: 1 },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true }
)

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema)

// ── Banner ────────────────────────────────────────────────────────────────────
const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: { type: String, required: true },
    mobileImage: String,
    link: String,
    position: {
      type: String,
      enum: ['hero', 'middle', 'category', 'sidebar', 'popup'],
      default: 'hero',
    },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
)

export const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema)

// ── Contact ───────────────────────────────────────────────────────────────────
const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
    adminNote: String,
  },
  { timestamps: true }
)

export const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema)

// ── Newsletter ────────────────────────────────────────────────────────────────
const NewsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Newsletter =
  mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema)

// ── SiteSettings ──────────────────────────────────────────────────────────────
const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    group: { type: String, default: 'general' },
  },
  { timestamps: true }
)

export const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)
