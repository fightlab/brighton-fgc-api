import mongoose, { Schema } from 'mongoose'

const characterSchema = new Schema({
  name: {
    type: String
  },
  short: {
    type: String,
    required: true
  },
  game: {
    type: Schema.Types.ObjectId,
    required: true
  }
})

const model = mongoose.model('Character', characterSchema)

export const schema = model.schema
export default model
