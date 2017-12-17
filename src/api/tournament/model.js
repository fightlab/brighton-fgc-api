import mongoose, { Schema } from 'mongoose'

const tournamentSchema = new Schema({
  name: {
    type: String
  },
  type: {
    type: String
  },
  game: {
    type: Schema.Types.ObjectId
  },
  dateStart: {
    type: Date
  },
  dateEnd: {
    type: Date
  },
  players: {
    type: [String]
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

tournamentSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      type: this.type,
      game: this.game,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      players: this.players,
      event: this.event,
      series: this.series,
      bracket: this.bracket,
      bracketImage: this.bracketImage,
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

const model = mongoose.model('Tournament', tournamentSchema)

export const schema = model.schema
export default model
