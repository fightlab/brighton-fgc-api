import { default as mongoose, Document, Schema } from 'mongoose';
import { Vod } from '@models/vod';
import { Match } from '@models/match';
import { Character } from '@models/character';

export interface IMatchVod {
  vod: Vod['_id'];
  match: Match['_id'];
  characters?: Array<Character['_id']>;
  timestamp?: string;
}

export interface MatchVod extends IMatchVod, Document {
  _vod?: Vod;
  _match?: Match;
  _characters?: Array<Character>;
}

const MatchVodSchema: Schema = new Schema({
  vod: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Vod',
  },
  match: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Match',
  },
  characters: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Character',
  },
  timestamp: {
    type: String,
    required: false,
    default: '0',
  },
});

MatchVodSchema.virtual('_vod', {
  ref: 'Vod',
  localField: 'vod',
  foreignField: '_id',
  justOne: true,
});

MatchVodSchema.virtual('_match', {
  ref: 'Match',
  localField: 'match',
  foreignField: '_id',
  justOne: true,
});

MatchVodSchema.virtual('_characters', {
  ref: 'Character',
  localField: 'characters',
  foreignField: '_id',
});

export const MatchVod = mongoose.model<MatchVod>(
  'MatchVod',
  MatchVodSchema,
  'match_vod',
);
