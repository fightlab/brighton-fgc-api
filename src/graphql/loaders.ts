import { default as DataLoader } from 'dataloader';
import { default as sift } from 'sift';
import { ReturnModelType } from '@typegoose/typegoose';

import { BracketPlatformModel } from '@models/bracket_platform';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

const makeGeneralLoader = (
  model: ReturnModelType<AnyParamConstructor<any>, {}>,
) =>
  new DataLoader(async (queries) => {
    try {
      const docs = await model.find({ $or: queries as Array<any> });
      return queries.map((query) => docs.filter(sift(query as any)));
    } catch (error) {
      console.error(error);
      return [];
    }
  });

const makeSingleGeneralLoader = (
  model: ReturnModelType<AnyParamConstructor<any>, {}>,
) =>
  new DataLoader(async (queries) => {
    try {
      const docs = await model.find({ $or: queries as Array<any> });
      return queries.map((query) => {
        const sifted = docs.filter(sift(query as any));
        if (sifted.length) return sifted[0];
        return {};
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  });

const BracketPlatformsLoader = makeGeneralLoader(BracketPlatformModel);
const BracketPlatformLoader = makeSingleGeneralLoader(BracketPlatformModel);

export interface Loaders {
  BracketPlatformsLoader: DataLoader<unknown, any[], unknown>;
  BracketPlatformLoader: DataLoader<unknown, any, unknown>;
}

export const loaders: Loaders = {
  BracketPlatformsLoader,
  BracketPlatformLoader,
};
