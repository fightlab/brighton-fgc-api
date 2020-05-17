import { default as mongoose, Document, Schema } from 'mongoose';
import { TournamentSeries } from '@models/tournament_series';
import { Player } from '@models/player';

export interface ITournamentSeriesElo {
  tournament_series: TournamentSeries['_id'];
  player: Player['_id'];
  score: number;
}

export interface TournamentSeriesElo extends ITournamentSeriesElo, Document {}

const TournamentSeriesEloSchema: Schema = new Schema({
  tournament_series: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'TournamentSeries',
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

export const TournamentSeriesElo = mongoose.model<TournamentSeriesElo>(
  'TournamentSeriesElo',
  TournamentSeriesEloSchema,
  'tournament_series_elo',
);
