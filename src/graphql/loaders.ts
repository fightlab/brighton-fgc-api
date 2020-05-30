// Use dataloader and sift to improve performance of graphql by caching the query keys
// objects are hashed using object-hash

import { default as DataLoader } from 'dataloader';
import { default as sift } from 'sift';
import { ReturnModelType } from '@typegoose/typegoose';
import { default as objectHash } from 'object-hash';
import { ObjectId } from 'mongodb';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

import { getConfig } from '@lib/config';

import { BracketPlatformModel } from '@models/bracket_platform';
import { GameModel } from '@models/game';
import { CharacterModel } from '@models/character';
import { PlayerModel } from '@models/player';
import { GameEloModel } from '@models/game_elo';
import { PlayerPlatformModel } from '@models/player_platform';
import { PlayerSocialModel } from '@models/player_social';
import { VenueModel } from '@models/venue';
import { EventModel } from '@models/event';

// replace instances of objectid with string representation for caching
const replacer = (v: any) => {
  // check if value is objectid
  if (v instanceof ObjectId) {
    // return hex string
    return v.toHexString();
  }
  // nothing to replace, so return the value
  return v;
};

// disable cache in test, since this will break tests
const { isTest } = getConfig();
const enableCache = !isTest();

// caching key function by hashing the object to generate a (most likely unique) hash
// to be used as the cache key
const cacheKeyFn = (key: any) => objectHash(key, { replacer });

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
      cache: enableCache,
      cacheKeyFn,
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
      cache: enableCache,
      cacheKeyFn,
    },
  );

const BracketPlatformsLoader = makeGeneralLoader(BracketPlatformModel);
const BracketPlatformLoader = makeSingleGeneralLoader(BracketPlatformModel);
const GamesLoader = makeGeneralLoader(GameModel);
const GameLoader = makeSingleGeneralLoader(GameModel);
const CharactersLoader = makeGeneralLoader(CharacterModel);
const CharacterLoader = makeSingleGeneralLoader(CharacterModel);
const PlayersLoader = makeGeneralLoader(PlayerModel);
const PlayerLoader = makeSingleGeneralLoader(PlayerModel);
const GameElosLoader = makeGeneralLoader(GameEloModel);
const GameEloLoader = makeSingleGeneralLoader(GameEloModel);
const PlayerPlatformsLoader = makeGeneralLoader(PlayerPlatformModel);
const PlayerPlatformLoader = makeSingleGeneralLoader(PlayerPlatformModel);
const PlayerSocialsLoader = makeGeneralLoader(PlayerSocialModel);
const PlayerSocialLoader = makeSingleGeneralLoader(PlayerSocialModel);
const VenuesLoader = makeGeneralLoader(VenueModel);
const VenueLoader = makeSingleGeneralLoader(VenueModel);
const EventsLoader = makeGeneralLoader(EventModel);
const EventLoader = makeSingleGeneralLoader(EventModel);

export interface Loaders {
  BracketPlatformsLoader: DataLoader<unknown, any[], unknown>;
  BracketPlatformLoader: DataLoader<unknown, any, unknown>;
  GamesLoader: DataLoader<unknown, any[], unknown>;
  GameLoader: DataLoader<unknown, any, unknown>;
  CharactersLoader: DataLoader<unknown, any[], unknown>;
  CharacterLoader: DataLoader<unknown, any, unknown>;
  PlayersLoader: DataLoader<unknown, any[], unknown>;
  PlayerLoader: DataLoader<unknown, any, unknown>;
  GameElosLoader: DataLoader<unknown, any[], unknown>;
  GameEloLoader: DataLoader<unknown, any, unknown>;
  PlayerPlatformsLoader: DataLoader<unknown, any[], unknown>;
  PlayerPlatformLoader: DataLoader<unknown, any, unknown>;
  PlayerSocialsLoader: DataLoader<unknown, any[], unknown>;
  PlayerSocialLoader: DataLoader<unknown, any, unknown>;
  VenuesLoader: DataLoader<unknown, any[], unknown>;
  VenueLoader: DataLoader<unknown, any, unknown>;
  EventsLoader: DataLoader<unknown, any[], unknown>;
  EventLoader: DataLoader<unknown, any, unknown>;
}

export const loaders: Loaders = {
  BracketPlatformsLoader,
  BracketPlatformLoader,
  GamesLoader,
  GameLoader,
  CharactersLoader,
  CharacterLoader,
  PlayersLoader,
  PlayerLoader,
  GameElosLoader,
  GameEloLoader,
  PlayerPlatformsLoader,
  PlayerPlatformLoader,
  PlayerSocialsLoader,
  PlayerSocialLoader,
  VenuesLoader,
  VenueLoader,
  EventsLoader,
  EventLoader,
};
