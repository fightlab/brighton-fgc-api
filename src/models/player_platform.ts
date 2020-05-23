import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { BracketPlatformClass } from '@models/bracket_platform';
import { PlayerClass } from '@models/player';

export class PlayerPlatformClass {
  @Property({
    required: true,
    ref: () => BracketPlatformClass,
  })
  public platform!: Ref<BracketPlatformClass>;

  @Property({
    required: true,
    ref: () => PlayerClass,
  })
  public player!: Ref<PlayerClass>;

  @Property()
  public platform_id?: string;

  @Property()
  public email_hash?: string;
}

export const PlayerPlatform = getModelForClass(PlayerPlatformClass, {
  options: {
    customName: 'PlayerPlatform',
  },
  schemaOptions: {
    collection: 'player_platform',
  },
});
