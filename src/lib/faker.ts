// USED FOR TESTING AND EARLY DEVELOPMENT ONLY
// TO GENERATE FAKE DATA FOR MONGOOSE
// WARNING WILL REMOVE ALL DATA FROM MONGO ON STARTUP AND SEED IT, IF SEED_DB IS SET

import faker from 'faker';
import mongoose from '@lib/mongoose';
import { default as moment, Moment } from 'moment';
import { sampleSize } from 'lodash';

// import all the models and interfaces;
import { IGame, Game } from '@models/game';
import { IVenue, Venue } from '@/models/venue';
import { IBracketPlatform, BracketPlatform } from '@/models/bracket_platform';
import { IVodPlatform, VodPlatform } from '@/models/vod_platform';
import { IEvent, Event } from '@/models/event';
import { IPlayer, Player } from '@/models/player';
import { ITournament, TOURNAMENT_TYPE, Tournament } from '@/models/tournament';

// set faker locale to something we're used to
faker.locale = 'en_GB';

interface DataLengths {
  game: number;
  event: number;
  player: number;
}

export const dataLengthsDefault: DataLengths = {
  game: 6,
  event: 64,
  player: 48,
};

// for values which aren't required
const getOptional = (val: any): any | undefined =>
  faker.random.boolean() ? val : undefined;

const generateDates = (num: number, length: number): [Moment, Moment] => {
  const now = moment.utc();
  const start = moment.utc(now).subtract(length, 'weeks').add(num, 'weeks');
  const end = moment.utc(start).add(4, 'hours');

  return [start, end];
};

// ENUMERABLE GENERATION

// GAME
const generateGame = (num: number): IGame => ({
  name: `Game #${num}`,
  short: `G${num}`,
  logo: getOptional(faker.image.imageUrl()),
  bg: getOptional(faker.image.imageUrl()),
  meta: getOptional(faker.hacker.phrase()),
});

// VENUE
const venues: Array<IVenue> = [
  {
    name: 'Brewdog Brighton',
    short: 'brewdog',
    address: 'Hectors House, 52-54 Grand Parade, Brighton BN2 9QA',
    google_maps: 'https://goo.gl/maps/5audhrfnXoWkyWHp8',
    website: 'https://www.brewdog.com/uk/bars/uk/brewdog-brighton/',
  },
  {
    name: 'Meltdown London',
    short: 'meltdown',
    address: '342 Caledonian Rd, Islington, London N1 1BB',
    google_maps: 'https://goo.gl/maps/tZRWMYhR7SHpeCUN8',
    website: 'https://www.meltdown.bar/london',
  },
];

// BRACKET PLATFORMS
const bracketPlatforms: Array<IBracketPlatform> = [
  {
    name: 'Challonge',
    url: 'https://challonge.com',
    api_url: 'https://api.challonge.com/v1/',
    api_docs: 'https://api.challonge.com/api.html',
  },
  {
    name: 'Smash.gg',
    url: 'https://smash.gg',
    api_url: 'https://api.smash.gg/gql/alpha',
    api_docs: 'https://smashgg-developer-portal.netlify.app/',
  },
];

// VOD PLATFORM
const vodPlatforms: Array<IVodPlatform> = [
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    watch_url: 'http://youtube.com/watch?v=',
    embed_url: 'https://www.youtube.com/embed/',
  },
];

// PLAYERS
const generatePlayer = (): IPlayer => ({
  handle: faker.internet.userName(),
  icon: getOptional(faker.internet.avatar()),
  team: getOptional(faker.hacker.abbreviation()),
  is_staff: getOptional(faker.random.boolean()),
});

// MAIN STRUCTS GEN
const generateEvent = (
  num: number,
  numEvents: number,
  venue: Venue,
): IEvent => {
  const [start, end] = generateDates(num, numEvents);
  return {
    name: `${venue.name} Event #${num + 1}`,
    date_end: end.toDate(),
    date_start: start.toDate(),
    venue: venue._id,
    short: `${venue.name[0]}${venue.name[1]}${num + 1}`,
  };
};

export const fakeData: (dataLengths?: DataLengths) => Promise<boolean> = async (
  dataLengths = dataLengthsDefault,
) => {
  // remove all data from collections
  const { collections } = mongoose.connection;
  const promises: Array<Promise<any>> = [];
  Object.keys(collections).forEach((collection) => {
    promises.push(collections[collection].deleteMany({}));
  });
  await Promise.all(promises);

  // ADDING ENUMERABLE TO THE DB
  // generate games
  const games: Array<IGame> = Array.from({ length: dataLengths.game }, (_, i) =>
    generateGame(i),
  );
  // add games to db
  const Games = await Game.create(games);

  // generate venues
  const Venues = await Venue.create(venues);

  // generate bracket platforms
  await BracketPlatform.create(bracketPlatforms);

  // generate vod platforms
  await VodPlatform.create(vodPlatforms);

  const players: Array<IPlayer> = Array.from(
    {
      length: dataLengths.player,
    },
    generatePlayer,
  );
  const Players = await Player.create(players);

  // ADDING MAIN STRUCTS

  // generate events
  const events: Array<IEvent> = Array.from(
    {
      length: dataLengths.event,
    },
    (_, i) => {
      const venue: Venue = Venues[i % Venues.length];
      return generateEvent(i, dataLengths.event, venue);
    },
  );
  const Events = await Event.create(events);

  // generate tournaments with parameters:
  // total, 2 * events, 2 per event
  // 90% chance of single game, 10% chance of 2 - 4 games
  // random number of players (min 4, max 32)
  // <= 6 players ROUND_ROBIN, else 95% chance double elim, 5% single elim
  const tournaments: Array<ITournament> = Array.from(
    {
      length: dataLengths.event * 2,
    },
    (_, i) => {
      const event = Events[i % Events.length];

      const numPlayers = faker.random.number({
        min: 4,
        max: 32,
      });
      const players: Array<Player['_id']> = sampleSize(Players, numPlayers).map(
        (player) => player._id,
      );

      const type =
        numPlayers <= 6
          ? TOURNAMENT_TYPE.ROUND_ROBIN
          : Math.random() < 0.9
          ? TOURNAMENT_TYPE.DOUBLE_ELIMINATION
          : TOURNAMENT_TYPE.SINGLE_ELIMINATION;

      const games: Array<Game['_id']> =
        Math.random() < 0.9
          ? sampleSize(Games, 1).map((game) => game._id)
          : sampleSize(Games, faker.random.number({ min: 2, max: 4 })).map(
              (game) => game._id,
            );

      return {
        name: `Tournament #${i + 1}`,
        date_start: event.date_start,
        date_end: event.date_end,
        players,
        type,
        games,
        event: event._id,
      };
    },
  );
  await Tournament.create(tournaments);

  return true;
};
