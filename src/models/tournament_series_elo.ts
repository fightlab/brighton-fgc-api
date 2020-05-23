import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { TournamentSeriesClass } from '@models/tournament_series';
import { PlayerClass } from '@models/player';

export class TournamentSeriesEloClass {
  @Property({
    required: true,
    ref: () => TournamentSeriesClass,
  })
  public tournament_series!: Ref<TournamentSeriesClass>;

  @Property({
    required: true,
    ref: () => PlayerClass,
  })
  public player!: Ref<PlayerClass>;

  @Property({ required: true })
  public score!: number;
}

export const TournamentSeriesElo = getModelForClass(TournamentSeriesEloClass, {
  options: {
    customName: 'TournamentSeriesElo',
  },
  schemaOptions: {
    collection: 'tournament_series_elo',
  },
});
