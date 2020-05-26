import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Game } from '@models/game';
import { Player } from '@models/player';

export class GameElo {
  @Property({
    required: true,
    ref: () => Game,
  })
  public game!: Ref<Game>;

  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Property({ required: true })
  public score!: number;
}

export const GameEloModel = getModelForClass(GameElo, {
  options: {
    customName: 'GameElo',
  },
  schemaOptions: {
    collection: 'game_elo',
  },
});
