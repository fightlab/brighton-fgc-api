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
import { EventSeriesModel } from '@models/event_series';
import { EventSocialModel } from '@models/event_social';
import { TournamentModel } from '@models/tournament';
import { BracketModel } from '@models/bracket';
import { MatchModel } from '@models/match';
import { MatchEloModel } from '@models/match_elo';
import { ResultModel } from '@models/result';
import { TournamentSeriesModel } from '@models/tournament_series';
import { TournamentSeriesEloModel } from '@models/tournament_series_elo';
import { VodPlatformModel } from '@models/vod_platform';
import { VodModel } from '@models/vod';
import { MatchVodModel } from '@models/match_vod';

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

// caching key function by hashing the object to generate a (most likely unique) hash
// to be used as the cache key
// use unorderedArrays true to sort arrays before hashing, since we don't care about the order
const cacheKeyFn = (key: any) =>
  objectHash(key, { replacer, unorderedArrays: true });

// disable cache in test, since this will break tests
const { isTest } = getConfig();
const enableCache = !isTest();

// use general loader to return multiple values (e.g. an array of events)
const makeGeneralLoader = (
  model: ReturnModelType<AnyParamConstructor<any>, unknown>,
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
  model: ReturnModelType<AnyParamConstructor<any>, unknown>,
) =>
  new DataLoader(
    async (queries) => {
      try {
        const docs = await model.find({ _id: { $in: queries as Array<any> } });
        return queries.map((query) => {
          // search through documents for the query we got
          // if matching query, return the first one
          // else return empty array
          const [sifted = {}] = docs.filter(sift({ _id: query as any } as any));
          return sifted;
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

// instantiate all the loaders here, dataloader docs suggest we make a new dataloader on each request
// but since our queries will return the same results on each request, we can define the dataloaders at once
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
const EventSeriesMultiLoader = makeGeneralLoader(EventSeriesModel); // use multi as series is both singular and plural
const EventSeriesLoader = makeSingleGeneralLoader(EventSeriesModel); // singular form by default
const EventSocialsLoader = makeGeneralLoader(EventSocialModel);
const EventSocialLoader = makeSingleGeneralLoader(EventSocialModel);
const TournamentsLoader = makeGeneralLoader(TournamentModel);
const TournamentLoader = makeSingleGeneralLoader(TournamentModel);
const BracketsLoader = makeGeneralLoader(BracketModel);
const BracketLoader = makeSingleGeneralLoader(BracketModel);
const MatchesLoader = makeGeneralLoader(MatchModel);
const MatchLoader = makeSingleGeneralLoader(MatchModel);
const MatchElosLoader = makeGeneralLoader(MatchEloModel);
const MatchEloLoader = makeSingleGeneralLoader(MatchEloModel);
const ResultsLoader = makeGeneralLoader(ResultModel);
const ResultLoader = makeSingleGeneralLoader(ResultModel);
const TournamentSeriesMultiLoader = makeGeneralLoader(TournamentSeriesModel); // use multi as series is both singular and plural
const TournamentSeriesLoader = makeSingleGeneralLoader(TournamentSeriesModel); // singular form by default
const TournamentSeriesElosLoader = makeGeneralLoader(TournamentSeriesEloModel);
const TournamentSeriesEloLoader = makeSingleGeneralLoader(
  TournamentSeriesEloModel,
);
const VodPlatformsLoader = makeGeneralLoader(VodPlatformModel);
const VodPlatformLoader = makeSingleGeneralLoader(VodPlatformModel);
const VodsLoader = makeGeneralLoader(VodModel);
const VodLoader = makeSingleGeneralLoader(VodModel);
const MatchVodsLoader = makeGeneralLoader(MatchVodModel);
const MatchVodLoader = makeSingleGeneralLoader(MatchVodModel);

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
  EventSeriesMultiLoader: DataLoader<unknown, any[], unknown>;
  EventSeriesLoader: DataLoader<unknown, any, unknown>;
  EventSocialsLoader: DataLoader<unknown, any[], unknown>;
  EventSocialLoader: DataLoader<unknown, any, unknown>;
  TournamentsLoader: DataLoader<unknown, any[], unknown>;
  TournamentLoader: DataLoader<unknown, any, unknown>;
  BracketsLoader: DataLoader<unknown, any[], unknown>;
  BracketLoader: DataLoader<unknown, any, unknown>;
  MatchesLoader: DataLoader<unknown, any[], unknown>;
  MatchLoader: DataLoader<unknown, any, unknown>;
  MatchElosLoader: DataLoader<unknown, any[], unknown>;
  MatchEloLoader: DataLoader<unknown, any, unknown>;
  ResultsLoader: DataLoader<unknown, any[], unknown>;
  ResultLoader: DataLoader<unknown, any, unknown>;
  TournamentSeriesMultiLoader: DataLoader<unknown, any[], unknown>;
  TournamentSeriesLoader: DataLoader<unknown, any, unknown>;
  TournamentSeriesElosLoader: DataLoader<unknown, any[], unknown>;
  TournamentSeriesEloLoader: DataLoader<unknown, any, unknown>;
  VodPlatformsLoader: DataLoader<unknown, any[], unknown>;
  VodPlatformLoader: DataLoader<unknown, any, unknown>;
  VodsLoader: DataLoader<unknown, any[], unknown>;
  VodLoader: DataLoader<unknown, any, unknown>;
  MatchVodsLoader: DataLoader<unknown, any[], unknown>;
  MatchVodLoader: DataLoader<unknown, any, unknown>;
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
  EventSeriesMultiLoader,
  EventSeriesLoader,
  EventSocialsLoader,
  EventSocialLoader,
  TournamentsLoader,
  TournamentLoader,
  BracketsLoader,
  BracketLoader,
  MatchesLoader,
  MatchLoader,
  MatchElosLoader,
  MatchEloLoader,
  ResultsLoader,
  ResultLoader,
  TournamentSeriesMultiLoader,
  TournamentSeriesLoader,
  TournamentSeriesElosLoader,
  TournamentSeriesEloLoader,
  VodPlatformsLoader,
  VodPlatformLoader,
  VodsLoader,
  VodLoader,
  MatchVodsLoader,
  MatchVodLoader,
};
