import { default as mongoose, Document, Schema } from 'mongoose';
import { Player } from '@models/player';

export interface PlayerSocial extends Document {
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

const PlayerSocialSchema: Schema = new Schema({
  player: {
    type: mongoose.ObjectId,
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

export const PlayerSocial = mongoose.model<PlayerSocial>(
  'PlayerSocial',
  PlayerSocialSchema,
  'player_social',
);
