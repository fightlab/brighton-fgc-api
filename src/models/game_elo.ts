import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Game } from '@models/game';
import { PlayerClass } from '@models/player';

export class GameEloClass {
  @Property({
    required: true,
    ref: () => Game,
  })
  public game!: Ref<Game>;

  @Property({
    required: true,
    ref: () => PlayerClass,
  })
  public player!: Ref<PlayerClass>;

  @Property({ required: true })
  public score!: number;
}

export const GameElo = getModelForClass(GameEloClass, {
  options: {
    customName: 'GameElo',
  },
  schemaOptions: {
    collection: 'game_elo',
  },
});
