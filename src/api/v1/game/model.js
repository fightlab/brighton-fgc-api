import mongoose, { Schema } from 'mongoose'

const gameSchema = new Schema({
  name: {
    type: String
  },
  short: {
    type: String
  },
  imageUrl: {
    type: String
  },
  bgUrl: {
    type: String
  },
  meta: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

gameSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      short: this.short,
      imageUrl: this.imageUrl,
      bgUrl: this.bgUrl,
      meta: this.meta,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Game', gameSchema)

export const schema = model.schema
export default model
