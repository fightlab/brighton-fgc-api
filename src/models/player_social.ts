import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import validator from 'validator';
import { Player } from '@models/player';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum PLAYER_SOCIAL_DESCRIPTIONS {
  DESCRIPTION = 'Social media information for a given player',
  ID = 'Unique identifier of this player social media document',
  PLAYER_ID = 'Unique identifier (_id) of the player that this social media information belongs to',
  PLAYER = 'Player that this social media information belongs to',
  WEB = 'Website',
  FACEBOOK = 'Facebook profile/page',
  TWITTER = 'Twitter handle',
  DISCORD = 'Discord username',
  INSTAGRAM = 'Instagram profile',
  GITHUB = 'GitHub profile',
  TWITCH = 'Twitch channel',
  YOUTUBE = 'YouTube channel',
  PLAYSTATION = 'Playstation Network Username',
  XBOX = 'Xbox Live Username',
  SWITCH = 'Nintendo Switch Friend Code',
  FIND_ONE = 'Find and get a players social media information based on a given player',
}

@ObjectType({
  description: PLAYER_SOCIAL_DESCRIPTIONS.DESCRIPTION,
})
@Index({ player: 1 })
export class PlayerSocial {
  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Player, {
    description: PLAYER_SOCIAL_DESCRIPTIONS.PLAYER,
  })
  @Property({
    required: true,
    ref: () => Player,
    unique: true,
  })
  public player!: Ref<Player>;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.FACEBOOK,
    nullable: true,
  })
  @Property()
  public facebook?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.WEB,
    nullable: true,
  })
  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'web',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public web?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.TWITTER,
    nullable: true,
  })
  @Property()
  public twitter?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.DISCORD,
    nullable: true,
  })
  @Property()
  public discord?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.INSTAGRAM,
    nullable: true,
  })
  @Property()
  public instagram?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.GITHUB,
    nullable: true,
  })
  @Property()
  public github?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.TWITCH,
    nullable: true,
  })
  @Property()
  public twitch?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.YOUTUBE,
    nullable: true,
  })
  @Property()
  public youtube?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.PLAYSTATION,
    nullable: true,
  })
  @Property()
  public playstation?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.XBOX,
    nullable: true,
  })
  @Property()
  public xbox?: string;

  @Field({
    description: PLAYER_SOCIAL_DESCRIPTIONS.SWITCH,
    nullable: true,
  })
  @Property()
  public switch?: string;
}

export const PlayerSocialModel = getModelForClass(PlayerSocial, {
  options: {
    customName: 'PlayerSocial',
  },
  schemaOptions: {
    collection: 'player_social',
  },
});
