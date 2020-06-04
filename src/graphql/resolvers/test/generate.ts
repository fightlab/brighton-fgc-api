import faker from 'faker';
import { BracketPlatform } from '@models/bracket_platform';
import { Game } from '@models/game';
import { ObjectId } from 'mongodb';
import { Character } from '@models/character';
import { Player } from '@models/player';
import { GameElo } from '@models/game_elo';
import { PlayerSocial } from '@models/player_social';
import { Venue } from '@models/venue';
import { Event } from '@models/event';
import moment, { Moment } from 'moment';
import { EventSeries } from '@models/event_series';
import { EventSocial } from '@models/event_social';
import { Tournament, TOURNAMENT_TYPE } from '@models/tournament';

// get optional value if random
const getOptional = (val: any): any | undefined =>
  faker.random.boolean() ? val : undefined;

// helper method to generate dates
const generateDates = (num: number, length: number): [Moment, Moment] => {
  const now = moment.utc();
  const start = moment.utc(now).subtract(length, 'weeks').add(num, 'weeks');
  const end = moment.utc(start).add(4, 'hours');

  return [start, end];
};

// generate a fake tournament bracket platform for testing
export const generateBracketPlatform = (min = true): BracketPlatform => {
  const obj: BracketPlatform = {
    name: faker.company.companyName(),
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    url: faker.internet.url(),
    api_url: faker.internet.url(),
    api_docs: faker.internet.url(),
    meta: {
      info: faker.hacker.phrase(),
    },
  };
};

// generate a fake game for testing
export const generateGame = (min = true): Game => {
  const obj: Game = {
    name: faker.hacker.noun(),
    short: faker.hacker.abbreviation(),
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    logo: faker.image.imageUrl(),
    bg: faker.image.imageUrl(),
    meta: {
      info: faker.hacker.phrase(),
    },
  };
};

// generate a character for testing, requires a game
export const generateCharacter = (game: ObjectId, min = true): Character => {
  const obj: Character = {
    name: faker.name.findName(),
    short: faker.name.firstName(),
    game,
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    image: faker.image.avatar(),
  };
};

// generate a player for testing
export const generatePlayer = (min = true): Player => {
  const obj: Player = {
    handle: faker.internet.userName(),
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    icon: faker.internet.avatar(),
    is_staff: faker.random.boolean(),
    team: faker.hacker.abbreviation(),
  };
};

// generate a game elo for testing, requires a game and player
export const generateGameElo = (player: ObjectId, game: ObjectId): GameElo => ({
  game,
  player,
  score: faker.random.number({
    min: 700,
    max: 1400,
  }),
});

// generate player social for testing
export const generatePlayerSocial = (
  player: ObjectId,
  type: 'full' | 'random' | 'min' = 'min',
): PlayerSocial => {
  const obj: PlayerSocial = {
    player,
  };

  if (type === 'min') {
    return obj;
  }

  return {
    ...obj,
    facebook:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    web:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    twitter:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    discord:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    instagram:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    twitch:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    youtube:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    github:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    playstation:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    switch:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
    xbox:
      type === 'random'
        ? getOptional(faker.internet.userName())
        : faker.internet.userName(),
  };
};

// generate venue for testing
export const generateVenue = (min = true): Venue => {
  const obj: Venue = {
    name: faker.company.companyName(),
    short: faker.company.catchPhraseNoun(),
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    address: faker.address.streetAddress(true),
    google_maps: `$https://goo.gl/maps/${faker.random.uuid()}`,
    website: faker.internet.url(),
  };
};

// generate event for testing
export const generateEvent = (venue: ObjectId, min = true): Event => {
  const [start, end] = generateDates(1, 1);

  const obj: Event = {
    name: faker.company.companyName(),
    date_end: end.toDate(),
    date_start: start.toDate(),
    venue,
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    short: faker.hacker.abbreviation(),
    info: faker.hacker.phrase(),
  };
};

// generate event series for testing
export const generateEventSeries = (
  events: Array<ObjectId>,
  min = true,
): EventSeries => {
  const obj: EventSeries = {
    name: faker.company.companyName(),
    events,
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    info: faker.hacker.phrase(),
  };
};

// generate event social for testing
export const generateEventSocial = (
  event: ObjectId,
  type: 'full' | 'random' | 'min' = 'min',
): EventSocial => {
  const obj: EventSocial = {
    event,
  };

  if (type === 'min') {
    return obj;
  }

  return {
    ...obj,
    facebook:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    web:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    twitter:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    discord:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    instagram:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    twitch:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    youtube:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
    meta:
      type === 'random'
        ? getOptional(faker.internet.url())
        : faker.internet.url(),
  };
};

// generate tournament for testing
export const generateTournament = (
  event: ObjectId,
  games: Array<ObjectId>,
  players: Array<ObjectId>,
  min = true,
): Tournament => {
  const [start, end] = generateDates(1, 1);

  const obj: Tournament = {
    name: faker.company.companyName(),
    date_start: start.toDate(),
    event,
    games,
    type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
    players,
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    date_end: end.toDate(),
    is_team_based: false,
  };
};
