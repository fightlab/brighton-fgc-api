import mongoose, { Schema } from 'mongoose'

const playerSchema = new Schema({
  name: {
    type: String
  },
  handle: {
    type: String
  },
  challongeUsername: {
    type: String
  },
  challongeName: {
    type: [String]
  },
  imageUrl: {
    type: String
  },
  twitter: {
    type: String
  },
  team: {
    type: String
  },
  isStaff: {
    type: boolean
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

playerSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      handle: this.handle,
      challongeUsername: this.challongeUsername,
      challongeName: this.challongeName,
      imageUrl: this.imageUrl,
      twitter: this.twitter,
      team: this.team,
      isStaff: this.isStaff,
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

const model = mongoose.model('Player', playerSchema)

export const schema = model.schema
export default model
