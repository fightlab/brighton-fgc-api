import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { default as mongoose, Document, Schema } from 'mongoose';

export interface IBracketPlatform {
  name: string;
  url?: string;
  api_url?: string;
  api_docs?: string;
  meta?: any;
}

export interface BracketPlatform extends IBracketPlatform, Document {}

const BracketPlatformSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  },
  api_url: {
    type: String,
    required: false,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'api_url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  },
  api_docs: {
    type: String,
    required: false,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'api_docs',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  },
  meta: {
    type: Schema.Types.Mixed,
    required: false,
  },
});

export const BracketPlatform = mongoose.model<BracketPlatform>(
  'BracketPlatform',
  BracketPlatformSchema,
  'bracket_platform',
);
