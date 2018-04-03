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
    type: Boolean
  },
  emailHash: {
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

playerSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      handle: this.handle,
      challongeUsername: this.challongeUsername,
      imageUrl: this.imageUrl,
      twitter: this.twitter,
      team: this.team,
      isStaff: this.isStaff,
      emailHash: this.emailHash
    }

    return full ? {
      meta: this.meta,
      challongeName: this.challongeName,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Player', playerSchema)

export const schema = model.schema
export default model
