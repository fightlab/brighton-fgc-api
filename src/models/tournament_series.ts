import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import { Game } from '@models/game';

export class TournamentSeries {
  @Property({ required: true })
  public name!: string;

  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournaments!: Array<Ref<Tournament>>;

  @Property()
  public info?: string;

  @Property({
    ref: () => Game,
  })
  public game?: Ref<Game>;
}

export const TournamentSeriesModel = getModelForClass(TournamentSeries, {
  options: {
    customName: 'TournamentSeries',
  },
  schemaOptions: {
    collection: 'tournament_series',
  },
});
