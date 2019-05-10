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
  challongeImageUrl: {
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
  profile: {
    facebook: String,
    instagram: String,
    twitter: String,
    web: String,
    playstation: String,
    xbox: String,
    discord: String,
    steam: String,
    github: String,
    twitch: String,
    default: {}
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
      team: this.team,
      isStaff: this.isStaff,
      emailHash: this.emailHash,
      profile: this.profile
    }

    return full ? {
      meta: this.meta,
      challongeName: this.challongeName,
      challongeImageUrl: this.challongeImageUrl,
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
