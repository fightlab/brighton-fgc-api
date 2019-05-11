import mongoose, { Schema } from 'mongoose'

const resultSchema = new Schema({
  _playerId: {
    type: Schema.Types.ObjectId,
    ref: 'Player'
  },
  _tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  rank: {
    type: Number
  },
  eloBefore: {
    type: Number
  },
  eloAfter: {
    type: Number
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

resultSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      _playerId: this._playerId,
      _tournamentId: this._tournamentId,
      rank: this.rank,
      eloBefore: this.eloBefore,
      eloAfter: this.eloAfter,
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

const model = mongoose.model('Result', resultSchema)

export const schema = model.schema
export default model
