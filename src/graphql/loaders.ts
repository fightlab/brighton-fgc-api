// Use dataloader and sift to improve performance of graphql by caching the query keys
// objects are hashed using object-hash

import { default as DataLoader } from 'dataloader';
import { default as sift } from 'sift';
import { ReturnModelType } from '@typegoose/typegoose';
import { default as objectHash } from 'object-hash';
import { ObjectId } from 'mongodb';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

import { BracketPlatformModel } from '@models/bracket_platform';
import { GameModel } from '@models/game';
import { CharacterModel } from '@models/character';

// use general loader to return multiple values (e.g. an array of events)
const makeGeneralLoader = (
  model: ReturnModelType<AnyParamConstructor<any>, {}>,
) =>
  new DataLoader(
    async (queries) => {
      try {
        const docs = await model.find({ $or: queries as Array<any> });
        return queries.map((query) => docs.filter(sift(query as any)));
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    {
      cacheKeyFn: (key) => objectHash.sha1(key),
    },
  );

// use single loader to return individual documents by id (e.g. one event)
const makeSingleGeneralLoader = (
  model: ReturnModelType<AnyParamConstructor<any>, {}>,
) =>
  new DataLoader(
    async (queries) => {
      try {
        const docs = await model.find({ _id: { $in: queries as Array<any> } });
        return queries.map((query) => {
          const sifted = docs.filter(sift({ _id: query as any } as any));
          if (sifted.length) return sifted[0];
          return {};
        });
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    {
      cacheKeyFn: (key: ObjectId) => key?.toHexString() || key?.toString(),
    },
  );

const BracketPlatformsLoader = makeGeneralLoader(BracketPlatformModel);
const BracketPlatformLoader = makeSingleGeneralLoader(BracketPlatformModel);
const GamesLoader = makeGeneralLoader(GameModel);
const GameLoader = makeSingleGeneralLoader(GameModel);
const CharactersLoader = makeGeneralLoader(CharacterModel);
const CharacterLoader = makeSingleGeneralLoader(CharacterModel);

export interface Loaders {
  BracketPlatformsLoader: DataLoader<unknown, any[], unknown>;
  BracketPlatformLoader: DataLoader<unknown, any, unknown>;
  GamesLoader: DataLoader<unknown, any[], unknown>;
  GameLoader: DataLoader<unknown, any, unknown>;
  CharactersLoader: DataLoader<unknown, any[], unknown>;
  CharacterLoader: DataLoader<unknown, any, unknown>;
}

export const loaders: Loaders = {
  BracketPlatformsLoader,
  BracketPlatformLoader,
  GamesLoader,
  GameLoader,
  CharactersLoader,
  CharacterLoader,
};
