import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { MatchClass } from '@models/match';
import { PlayerClass } from '@models/player';

export class MatchEloClass {
  @Property({
    required: true,
    ref: () => MatchClass,
  })
  public match!: Ref<MatchClass>;

  @Property({
    required: true,
    ref: () => PlayerClass,
  })
  public player!: Ref<PlayerClass>;

  @Property({ required: true })
  public before!: number;

  @Property({ required: true })
  public after!: number;
}

export const MatchElo = getModelForClass(MatchEloClass, {
  options: {
    customName: 'MatchElo',
  },
  schemaOptions: {
    collection: 'match_elo',
  },
});
