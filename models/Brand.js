import mongoose from 'mongoose'

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    description: String,
    website: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema)
