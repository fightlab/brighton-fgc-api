import { default as mongoose, Document, Schema } from 'mongoose';
import { Game } from '@models/game';
import { Player } from '@models/player';

export interface GameElo extends Document {
  game: Game['_id'];
  player: Player['_id'];
  score: number;
}

const GameEloSchema: Schema = new Schema({
  game: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Game',
  },
  player: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Player',
  },
  score: {
    type: Number,
    required: true,
  },
});

export const GameElo = mongoose.model<GameElo>(
  'GameElo',
  GameEloSchema,
  'game_elo',
);
