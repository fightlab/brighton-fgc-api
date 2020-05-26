import {
  prop as Property,
  getModelForClass,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export class Match {
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament: Ref<Tournament>;

  @Property({
    ref: () => Player,
  })
  public player1?: Array<Ref<Player>>;

  @Property({
    ref: () => Player,
  })
  public player2?: Array<Ref<Player>>;

  @Property()
  public score1?: number;

  @Property()
  public score2?: number;

  @Property({
    ref: () => Player,
  })
  public winner?: Array<Ref<Player>>;

  @Property({
    ref: () => Player,
  })
  public loser?: Array<Ref<Player>>;

  @Property()
  public round?: number;

  @Property()
  public round_name?: string;

  @Property({ type: Schema.Types.Mixed })
  public meta?: any;
}

export const MatchModel = getModelForClass(Match, {
  options: {
    customName: 'Match',
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: 'match',
  },
});
