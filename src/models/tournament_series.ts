import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Game } from '@models/game';

export interface ITournamentSeries {
  name: string;
  tournaments: Array<Tournament['_id']>;
  info?: string;
  game?: Game['_id'];
}

export interface TournamentSeries extends ITournamentSeries, Document {
  _tournaments?: Array<Tournament>;
  _game?: Game;
}

const TournamentSeriesSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tournaments: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Tournament',
    default: [],
  },
  info: {
    type: String,
    required: false,
  },
  game: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Game',
  },
});

TournamentSeriesSchema.virtual('_tournaments', {
  ref: 'Tournament',
  localField: 'tournaments',
  foreignField: '_id',
});

TournamentSeriesSchema.virtual('_game', {
  ref: 'Game',
  localField: 'game',
  foreignField: '_id',
  justOne: true,
});

export const TournamentSeries = mongoose.model<TournamentSeries>(
  'TournamentSeries',
  TournamentSeriesSchema,
  'tournament_series',
);
