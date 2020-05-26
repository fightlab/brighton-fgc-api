import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Match } from '@models/match';
import { Player } from '@models/player';

export class MatchElo {
  @Property({
    required: true,
    ref: () => Match,
  })
  public match!: Ref<Match>;

  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Property({ required: true })
  public before!: number;

  @Property({ required: true })
  public after!: number;
}

export const MatchEloModel = getModelForClass(MatchElo, {
  options: {
    customName: 'MatchElo',
  },
  schemaOptions: {
    collection: 'match_elo',
  },
});
