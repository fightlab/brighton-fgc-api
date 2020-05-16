import { default as mongoose, Document, Schema } from 'mongoose';

export interface IPlayer {
  handle: string;
  icon?: string;
  team?: string;
  is_staff?: boolean;
}

export interface Player extends IPlayer, Document {}

const PlayerSchema: Schema = new Schema({
  handle: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: false,
  },
  team: {
    type: String,
    required: false,
  },
  is_staff: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export const Player = mongoose.model<Player>('Player', PlayerSchema, 'player');
