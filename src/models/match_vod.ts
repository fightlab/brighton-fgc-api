import { default as mongoose, Document, Schema } from 'mongoose';
import { Vod } from '@models/vod';
import { Match } from '@models/match';
import { Character } from '@models/character';

export interface MatchVod extends Document {
  vod: Vod['_id'];
  match: Match['_id'];
  characters?: Array<Character['_id']>;
  timestamp?: string;
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
    type: Schema.Types.ObjectId,
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
