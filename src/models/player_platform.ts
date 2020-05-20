import { default as mongoose, Document, Schema } from 'mongoose';
import { BracketPlatform } from '@models/bracket_platform';
import { Player } from '@models/player';

export interface IPlayerPlatform {
  platform: BracketPlatform['_id'];
  player: Player['_id'];
  platform_id?: string;
  email_hash?: string;
}

export interface PlayerPlatform extends IPlayerPlatform, Document {
  _platform?: BracketPlatform;
  _player?: Player;
}

const PlayerPlatformSchema: Schema = new Schema({
  platform: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'BracketPlatform',
  },
  player: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player',
  },
  platform_id: {
    type: String,
    required: false,
  },
  email_hash: {
    type: String,
    required: false,
  },
});

PlayerPlatformSchema.virtual('_platform', {
  ref: 'BracketPlatform',
  localField: 'platform',
  foreignField: '_id',
  justOne: true,
});

PlayerPlatformSchema.virtual('_player', {
  ref: 'Player',
  localField: 'player',
  foreignField: '_id',
  justOne: true,
});

export const PlayerPlatform = mongoose.model<PlayerPlatform>(
  'PlayerPlatform',
  PlayerPlatformSchema,
  'player_platform',
);
