import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import { Game } from '@models/game';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum TOURNAMENT_SERIES_DESCRIPTIONS {
  DESCRIPTION = 'A group of tournaments combined to make a series',
  ID = 'Unique identifier of a tournament series',
  IDS = 'List of unique identifiers (_id) of multiple tournament series',
  NAME = 'Name of the tournament series',
  TOURNAMENTS = 'List of tournaments belonging to this tournament series',
  TOURNAMENT_IDS = 'List of unique ids of tournaments belonging to one or more tournament series',
  INFO = 'Additional information about this tournament series',
  GAME = 'Game that belong to this tournament series',
  GAME_ID = 'Unique id of a game that belongs to a tournament series',
  GAME_IDS = 'List of unique ids of a game that belongs to a tournament series',
  FIND_ONE = 'Get an tournament series by id',
  FIND = 'Get a list of tournament series, or search for a particular tournament series',
}

@ObjectType({
  description: TOURNAMENT_SERIES_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 1 })
@Index({ tournaments: 1 })
@Index({ game: 1 })
export class TournamentSeries {
  @Field({
    description: TOURNAMENT_SERIES_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: TOURNAMENT_SERIES_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field(() => [Tournament], {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.TOURNAMENTS,
  })
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournaments!: Array<Ref<Tournament>>;

  @Field({
    description: TOURNAMENT_SERIES_DESCRIPTIONS.INFO,
    nullable: true,
  })
  @Property()
  public info?: string;

  @Field(() => Game, {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.GAME,
    nullable: true,
  })
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
