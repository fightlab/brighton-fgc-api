import mongoose, { Schema } from 'mongoose'

const eloSchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  game: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Game'
  },
  elo: {
    type: Number,
    required: true,
    default: 1000
  },
  tournaments: [{
    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    eloStart: {
      type: Number
    },
    eloEnd: {
      type: Number
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

eloSchema.methods = {
  view (full) {
    const view = {
      id: this.id,
      player: this.player,
      game: this.game,
      elo: this.elo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      tournaments: this.tournaments,
      ...view
    } : view
  }
}

const model = mongoose.model('Elo', eloSchema)

export const schema = model.schema
export default model
