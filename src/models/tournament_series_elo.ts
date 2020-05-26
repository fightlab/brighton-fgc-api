import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { TournamentSeries } from '@models/tournament_series';
import { Player } from '@models/player';

export class TournamentSeriesElo {
  @Property({
    required: true,
    ref: () => TournamentSeries,
  })
  public tournament_series!: Ref<TournamentSeries>;

  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Property({ required: true })
  public score!: number;
}

export const TournamentSeriesEloModel = getModelForClass(TournamentSeriesElo, {
  options: {
    customName: 'TournamentSeriesElo',
  },
  schemaOptions: {
    collection: 'tournament_series_elo',
  },
});
