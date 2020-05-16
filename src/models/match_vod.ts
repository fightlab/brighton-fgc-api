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

export interface MatchVod extends IMatchVod, Document {}

const MatchVodSchema: Schema = new Schema({
  vod: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Vod',
  },
  match: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Match',
  },
  characters: {
    type: mongoose.Types.ObjectId,
    required: false,
    ref: 'Character',
  },
  timestamp: {
    type: String,
    required: false,
  },
});

export const MatchVod = mongoose.model<MatchVod>(
  'Vod',
  MatchVodSchema,
  'match_vod',
);
