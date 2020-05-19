import { default as mongoose, Document, Schema } from 'mongoose';
import { Game } from '@models/game';
import { Player } from '@models/player';

export interface IGameElo {
  game: Game['_id'];
  player: Player['_id'];
  score: number;
}

export interface GameElo extends IGameElo, Document {
  _game?: Game;
  _player?: Player;
}

const GameEloSchema: Schema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Game',
  },
  player: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player',
  },
  score: {
    type: Number,
    required: true,
  },
});

GameEloSchema.virtual('_game', {
  ref: 'Game',
  localField: 'game',
  foreignField: '_id',
  justOne: true,
});

GameEloSchema.virtual('_player', {
  ref: 'Player',
  localField: 'player',
  foreignField: '_id',
  justOne: true,
});

export const GameElo = mongoose.model<GameElo>(
  'GameElo',
  GameEloSchema,
  'game_elo',
);
