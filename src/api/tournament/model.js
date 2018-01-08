import mongoose, { Schema } from 'mongoose'

const tournamentSchema = new Schema({
  name: {
    type: String
  },
  type: {
    type: String
  },
  _gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game'
  },
  dateStart: {
    type: Date
  },
  dateEnd: {
    type: Date
  },
  players: {
    type: [Schema.Types.ObjectId],
    ref: 'Player'
  },
  event: {
    type: [String]
  },
  series: {
    type: [String]
  },
  bracket: {
    type: String
  },
  bracketImage: {
    type: String
  },
  signUpUrl: {
    type: String
  },
  challongeId: {
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

tournamentSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      type: this.type,
      _gameId: this._gameId,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      event: this.event,
      series: this.series,
      bracket: this.bracket,
      bracketImage: this.bracketImage,
      signUpUrl: this.signUpUrl,
      challongeId: this.challongeId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view,
      meta: this.meta,
      players: this.players
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Tournament', tournamentSchema)

export const schema = model.schema
export default model
