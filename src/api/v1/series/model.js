import mongoose, { Schema } from 'mongoose'

const seriesSchema = new Schema({
  name: {
    type: String
  },
  _gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game'
  },
  isCurrent: {
    type: Boolean
  },
  points: {
    type: [Number],
    default: [16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1]
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
      _gameId: this._gameId,
      points: this.points,
      isCurrent: this.isCurrent,
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

const model = mongoose.model('Series', seriesSchema)

export const schema = model.schema
export default model
