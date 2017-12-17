import mongoose, { Schema } from 'mongoose'

const seriesSchema = new Schema({
  name: {
    type: String
  },
  game: {
    type: Schema.Types.ObjectId
  },
  isCurrent: {
    type: Boolean
  },
  meta: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

seriesSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      game: this.game,
      isCurrent: this.isCurrent,
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

const model = mongoose.model('Series', seriesSchema)

export const schema = model.schema
export default model
