import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Game } from '@models/game';

export interface TournamentSeries extends Document {
  name: string;
  tournaments: Array<Tournament['_id']>;
  info?: string;
  game?: Game['_id'];
}

const TournamentSeriesSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tournament: {
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

export const TournamentSeries = mongoose.model<TournamentSeries>(
  'TournamentSeries',
  TournamentSeriesSchema,
  'tournament_series',
);
