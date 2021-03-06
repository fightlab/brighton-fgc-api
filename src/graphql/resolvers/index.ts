import { MongooseFilterQuery } from 'mongoose';
import { Many } from 'lodash';

import { BracketPlatformResolver } from '@graphql/resolvers/bracket_platform';
import { GameResolver } from '@graphql/resolvers/game';
import { CharacterResolver } from '@graphql/resolvers/character';
import { PlayerResolver } from '@graphql/resolvers/player';
import { GameEloResolver } from '@graphql/resolvers/game_elo';
import { PlayerSocialResolver } from '@graphql/resolvers/player_social';
import { VenueResolver } from '@graphql/resolvers/venue';
import { EventResolver } from '@graphql/resolvers/event';
import { EventSeriesResolver } from '@graphql/resolvers/event_series';
import { EventSocialResolver } from '@graphql/resolvers/event_social';
import { TournamentResolver } from '@graphql/resolvers/tournament';
import { BracketResolver } from '@graphql/resolvers/bracket';
import { MatchResolver } from '@graphql/resolvers/match';
import { MatchEloResolver } from '@graphql/resolvers/match_elo';
import { ResultResolver } from '@graphql/resolvers/result';
import { TournamentSeriesResolver } from '@graphql/resolvers/tournament_series';
import { TournamentSeriesEloResolver } from '@graphql/resolvers/tournament_series_elo';
import { VodPlatformResolver } from '@graphql/resolvers/vod_platform';
import { VodResolver } from '@graphql/resolvers/vod';
import { MatchVodResolver } from '@graphql/resolvers/match_vod';
import { AuthResolver } from './auth';

// Mongoose query helper type
export type MongooseQuery = MongooseFilterQuery<
  Pick<any, string | number | symbol>
>;

// map sort helper return type
export type MapSort = [
  // eslint-disable-next-line @typescript-eslint/ban-types
  string | Function | Array<string | Function>,
  Many<boolean | 'asc' | 'desc'> | Array<boolean | 'asc' | 'desc'>,
];

// resolver query helper object generation
export const generateMongooseQueryObject = (): MongooseQuery => ({});

// add all resolvers here
// eslint-disable-next-line @typescript-eslint/ban-types
export const resolvers: [Function, ...Function[]] = [
  AuthResolver,
  BracketPlatformResolver,
  GameResolver,
  CharacterResolver,
  PlayerResolver,
  GameEloResolver,
  PlayerSocialResolver,
  VenueResolver,
  EventResolver,
  EventSeriesResolver,
  EventSocialResolver,
  TournamentResolver,
  BracketResolver,
  MatchResolver,
  MatchEloResolver,
  ResultResolver,
  TournamentSeriesResolver,
  TournamentSeriesEloResolver,
  VodPlatformResolver,
  VodResolver,
  MatchVodResolver,
];
