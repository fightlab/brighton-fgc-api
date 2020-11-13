import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { BracketPlatform } from '@models/bracket_platform';
import { Player } from '@models/player';

export class PlayerPlatform {
  @Property({
    required: true,
    ref: () => BracketPlatform,
  })
  public platform!: Ref<BracketPlatform>;

  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Property()
  public platform_id?: string;

  @Property()
  public email_hash?: string;
}

export const PlayerPlatformModel = getModelForClass(PlayerPlatform, {
  options: {
    customName: 'PlayerPlatform',
  },
  schemaOptions: {
    collection: 'player_platform',
  },
});
