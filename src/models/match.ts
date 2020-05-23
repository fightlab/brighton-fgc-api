import {
  prop as Property,
  getModelForClass,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { TournamentClass } from '@models/tournament';
import { PlayerClass } from '@models/player';

export class MatchClass {
  @Property({
    required: true,
    ref: () => TournamentClass,
  })
  public tournament: Ref<TournamentClass>;

  @Property({
    ref: () => PlayerClass,
  })
  public player1?: Array<Ref<PlayerClass>>;

  @Property({
    ref: () => PlayerClass,
  })
  public player2?: Array<Ref<PlayerClass>>;

  @Property()
  public score1?: number;

  @Property()
  public score2?: number;

  @Property({
    ref: () => PlayerClass,
  })
  public winner?: Array<Ref<PlayerClass>>;

  @Property({
    ref: () => PlayerClass,
  })
  public loser?: Array<Ref<PlayerClass>>;

  @Property()
  public round?: number;

  @Property()
  public round_name?: string;

  @Property({ type: Schema.Types.Mixed })
  public meta?: any;
}

export const Match = getModelForClass(MatchClass, {
  options: {
    customName: 'Match',
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: 'match',
  },
});
