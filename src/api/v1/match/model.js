import mongoose, { Schema } from 'mongoose'

const matchSchema = new Schema({
  _tournamentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament'
  },
  _player1Id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  _player2Id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  _winnerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  _loserId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  _player1EloBefore: {
    type: Number
  },
  _player1EloAfter: {
    type: Number
  },
  _player2EloBefore: {
    type: Number
  },
  _player2EloAfter: {
    type: Number
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
    type: Date
  },
  endDate: {
    type: Date
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
      _player1EloBefore: this._player1EloBefore,
      _player2EloBefore: this._player2EloBefore,
      _player2EloAfter: this._player2EloAfter,
      _player1EloAfter: this._player1EloAfter,
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
