import mongoose from 'mongoose'

const VariantSchema = new mongoose.Schema({
  label: { type: String, required: true },   // e.g. "3D Wood — 2400×600mm"
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, default: 0 },
  images: [String],
  attributes: { type: Map, of: String },      // { Color: 'Ivory', Size: '2400x600' }
  isDefault: { type: Boolean, default: false },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
})

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true },
    type: { type: String, enum: ['simple', 'variable'], default: 'simple' },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    tags: [String],

    description: { type: String },
    shortDescription: { type: String },
    specifications: [{ key: String, value: String }],

    images: [String],    // main image set (for simple products / fallback)
    thumbnail: String,

    // Simple product pricing/stock
    price: { type: Number },
    salePrice: { type: Number },
    stock: { type: Number, default: 0 },

    // Variable product
    attributes: [{ name: String, values: [String] }],
    variants: [VariantSchema],

    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },

    // Merchandising
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // SEO
    metaTitle: String,
    metaDescription: String,

    // Aggregated ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Computed fields
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ isFeatured: 1, isActive: 1 })
ProductSchema.index({ isNewArrival: 1, isActive: 1 })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
