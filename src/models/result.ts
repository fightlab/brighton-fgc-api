import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { isNumber } from 'lodash';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum RESULT_DESCRIPTIONS {
  DESCRIPTION = 'Result for a player (or team of players) at a given tournament',
  ID = 'Unique identifier of a result',
  IDS = 'List of unique identifiers (_id) of multiple results',
  TOURNAMENT = 'Tournament that the result is from',
  TOURNAMENT_ID = 'Unique identifier (_id) of the tournament that the result is from',
  TOURNAMENT_IDS = 'List of unique identifiers (_id) of tournaments that have results',
  PLAYER = 'Player(s) that this result belongs to',
  PLAYER_ID = 'Unique identifier (_id) of the player(s) that the result belongs to',
  PLAYER_IDS = 'List of unique identifiers (_id) of players that have results',
  RANK = 'Position the player finished the tournament at, position 0 means unranked',
  RANK_MIN = 'Minimum rank to search for',
  RANK_MAX = 'Maximum rank to search for',
  FIND_ONE = 'Find and get a single result by id, tournament, and/or game',
  FIND = 'Find and get some or all results',
}

@ObjectType({
  description: RESULT_DESCRIPTIONS.DESCRIPTION,
})
export class Result {
  @Field({
    description: RESULT_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Tournament, {
    description: RESULT_DESCRIPTIONS.TOURNAMENT,
  })
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament!: Ref<Tournament>;

  @Field(() => [Player], {
    description: RESULT_DESCRIPTIONS.PLAYER,
  })
  @Property({
    required: true,
    ref: () => Player,
  })
  public players!: Array<Ref<Player>>;

  @Field({
    description: RESULT_DESCRIPTIONS.RANK,
  })
  @Property({
    required: true,
    default: 0,
    validate: {
      message: generateValidationMessage(
        'rank',
        VALIDATION_MESSAGES.RESULT_RANK_VALIDATION_ERROR,
      ),
      validator: (v: any) => isNumber(v) && v >= 0,
    },
  })
  public rank!: number;
}

export const ResultModel = getModelForClass(Result, {
  options: {
    customName: 'Result',
  },
  schemaOptions: {
    collection: 'result',
  },
});
