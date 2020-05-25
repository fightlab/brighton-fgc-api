import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { TournamentClass } from '@models/tournament';
import { Game } from '@models/game';

export class TournamentSeriesClass {
  @Property({ required: true })
  public name!: string;

  @Property({
    required: true,
    ref: () => TournamentClass,
  })
  public tournaments!: Array<Ref<TournamentClass>>;

  @Property()
  public info?: string;

  @Property({
    ref: () => Game,
  })
  public game?: Ref<Game>;
}

export const TournamentSeries = getModelForClass(TournamentSeriesClass, {
  options: {
    customName: 'TournamentSeries',
  },
  schemaOptions: {
    collection: 'tournament_series',
  },
});
