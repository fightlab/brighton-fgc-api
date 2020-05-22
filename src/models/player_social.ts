import validator from 'validator';
import { default as mongoose, Document, Schema } from 'mongoose';
import { Player } from '@models/player';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

export interface IPlayerSocial {
  player: Player['_id'];
  facebook?: string;
  web?: string;
  twitter?: string;
  discord?: string;
  instagram?: string;
  github?: string;
  twitch?: string;
  youtube?: string;
  playstation?: string;
  xbox?: string;
  switch?: string;
}

export interface PlayerSocial extends IPlayerSocial, Document {
  _player?: Player;
}

const PlayerSocialSchema: Schema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player',
  },
  facebook: {
    type: String,
    required: false,
  },
  web: {
    type: String,
    required: false,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'web',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  },
  twitter: {
    type: String,
    required: false,
  },
  discord: {
    type: String,
    required: false,
  },
  instagram: {
    type: String,
    required: false,
  },
  github: {
    type: String,
    required: false,
  },
  twitch: {
    type: String,
    required: false,
  },
  youtube: {
    type: String,
    required: false,
  },
  playstation: {
    type: String,
    required: false,
  },
  xbox: {
    type: String,
    required: false,
  },
  switch: {
    type: String,
    required: false,
  },
});

PlayerSocialSchema.virtual('_player', {
  ref: 'Player',
  localField: 'player',
  foreignField: '_id',
  justOne: true,
});

export const PlayerSocial = mongoose.model<PlayerSocial>(
  'PlayerSocial',
  PlayerSocialSchema,
  'player_social',
);
