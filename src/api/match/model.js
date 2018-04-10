import mongoose, { Schema } from 'mongoose'

const matchSchema = new Schema({
  _tournamentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  _player1Id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  _player2Id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  _winnerId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  _loserId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  score: {
    type: [Schema.Types.Mixed]
  },
  round: {
    type: Number,
    required: true
  },
  challongeMatchObj: {
    type: Schema.Types.Mixed,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

matchSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      _tournamentId: this._tournamentId,
      _player1Id: this._player1Id,
      _player2Id: this._player2Id,
      _winnerId: this._winnerId,
      _loserId: this._loserId,
      score: this.score,
      round: this.round,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      challongeMatchObj: this.challongeMatchObj,
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Match', matchSchema)

export const schema = model.schema
export default model
