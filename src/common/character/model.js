import mongoose, { Schema } from 'mongoose'

const characterSchema = new Schema({
  name: {
    type: String
  },
  short: {
    type: String,
    required: true
  },
  game: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

characterSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      short: this.short,
      game: this.game,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Character', characterSchema)

export const schema = model.schema
export default model
