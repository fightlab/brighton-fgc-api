import mongoose, { Schema } from 'mongoose'

const eventSchema = new Schema({
  number: {
    type: Number
  },
  name: {
    type: String
  },
  date: {
    type: Date
  },
  url: {
    type: String
  },
  venue: {
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

eventSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      number: this.number,
      name: this.name,
      date: this.date,
      url: this.url,
      venue: this.venue,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      meta: this.meta,
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Event', eventSchema)

export const schema = model.schema
export default model
