// USED FOR TESTING AND EARLY DEVELOPMENT ONLY
// TO GENERATE FAKE DATA FOR MONGOOSE
// WARNING WILL REMOVE ALL DATA FROM MONGO ON STARTUP AND SEED IT, IF SEED_DB IS SET

import faker from 'faker';
import mongoose from '@lib/mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { default as moment, Moment } from 'moment';
import {
  sampleSize,
  groupBy,
  values,
  sample,
  shuffle,
  chunk,
  compact,
} from 'lodash';
import { createHash } from 'crypto';

// import all the models and interfaces;
import {
  BracketPlatform,
  BracketPlatformModel,
} from '@models/bracket_platform';
import { Bracket, BracketModel } from '@models/bracket';
import { Character, CharacterModel } from '@models/character';
import { EventSeries, EventSeriesModel } from '@models/event_series';
import { EventSocial, EventSocialModel } from '@models/event_social';
import { Event, EventModel } from '@models/event';
import { GameElo, GameEloModel } from '@models/game_elo';
import { Game, GameModel } from '@models/game';
import { MatchElo, MatchEloModel } from '@models/match_elo';
import { MatchVod, MatchVodModel } from '@models/match_vod';
import { Match, MatchModel } from '@models/match';
import { PlayerPlatform, PlayerPlatformModel } from '@models/player_platform';
import { PlayerSocial, PlayerSocialModel } from '@models/player_social';
import { Player, PlayerModel } from '@models/player';
import { Result, ResultModel } from '@models/result';
import {
  TournamentSeriesEloModel,
  TournamentSeriesElo,
} from '@models/tournament_series_elo';
import {
  TournamentSeries,
  TournamentSeriesModel,
} from '@models/tournament_series';
import {
  Tournament,
  TOURNAMENT_TYPE,
  TournamentModel,
} from '@models/tournament';
import { Venue, VenueModel } from '@models/venue';
import { VodPlatform, VodPlatformModel } from '@models/vod_platform';
import { Vod, VodModel } from '@models/vod';

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
const generateGame = (num: number): Game => ({
  name: `Game #${num}`,
  short: `G${num}`,
  logo: getOptional(faker.image.imageUrl()),
  bg: getOptional(faker.image.imageUrl()),
  meta: getOptional(faker.hacker.phrase()),
});

// VENUE
const venues: Array<Venue> = [
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
const bracketPlatforms: Array<BracketPlatform> = [
  {
    name: 'Challonge',
    url: 'https://challonge.com',
    api_url: 'https://api.challonge.com/v1',
    api_docs: 'https://api.challonge.com/api.html',
  },
  {
    name: 'Smash.gg',
    url: 'https://smash.gg',
    api_url: 'https://api.smash.gg/gql/alpha',
    api_docs: 'https://smashgg-developer-portal.netlify.app',
  },
];

// VOD PLATFORM
const vodPlatforms: Array<VodPlatform> = [
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    watch_url: 'http://youtube.com/watch?v=',
    embed_url: 'https://www.youtube.com/embed/',
  },
];

// PLAYERS
const generatePlayer = (): Player => ({
  handle: faker.internet.userName(),
  icon: getOptional(faker.internet.avatar()),
  team: getOptional(faker.hacker.abbreviation()),
  is_staff: getOptional(faker.random.boolean()),
});

// MAIN STRUCTS GEN
const generateEvent = (
  num: number,
  numEvents: number,
  venue: DocumentType<Venue>,
): Event => {
  const [start, end] = generateDates(num, numEvents);
  return {
    name: `${venue.name} Event #${num + 1}`,
    date_end: end.toDate(),
    date_start: start.toDate(),
    venue: venue._id,
    short: `${venue.name[0]}${venue.name[1]}${num + 1}`,
    info: getOptional(faker.lorem.paragraphs(2)),
  };
};

// bracket
const generateBracket = (
  tournament: DocumentType<Tournament>,
  platform: DocumentType<BracketPlatform>,
): Bracket => {
  const slug = faker.lorem.slug();
  return {
    tournament: tournament._id,
    platform: platform._id,
    platform_id: faker.random.uuid(),
    slug,
    url: `${platform.url}/${slug}`,
    image: getOptional(faker.image.imageUrl()),
  };
};

// event social mock
const generateEventSocial = (event: DocumentType<Event>): EventSocial => ({
  event: event._id,
  facebook: getOptional(faker.internet.url()),
  web: getOptional(faker.internet.url()),
  twitter: getOptional(faker.internet.url()),
  discord: getOptional(faker.internet.url()),
  instagram: getOptional(faker.internet.url()),
  twitch: getOptional(faker.internet.url()),
  youtube: getOptional(faker.internet.url()),
  meta: getOptional(faker.internet.url()),
});

// player social mock
const generatePlayerSocial = (player: DocumentType<Player>): PlayerSocial => ({
  player: player._id,
  facebook: getOptional(faker.internet.userName()),
  web: getOptional(faker.internet.url()),
  twitter: getOptional(faker.internet.userName()),
  discord: getOptional(faker.internet.userName()),
  instagram: getOptional(faker.internet.userName()),
  twitch: getOptional(faker.internet.userName()),
  youtube: getOptional(faker.internet.userName()),
  github: getOptional(faker.internet.userName()),
  playstation: getOptional(faker.internet.userName()),
  switch: getOptional(faker.internet.userName()),
  xbox: getOptional(faker.internet.userName()),
});

// generate character
const generateCharacter = (game: DocumentType<Game>): Character => ({
  game: game._id,
  name: faker.name.findName(),
  short: faker.name.firstName(),
  image: getOptional(faker.internet.avatar()),
});

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
  const games: Array<Game> = Array.from({ length: dataLengths.game }, (_, i) =>
    generateGame(i),
  );
  // add games to db
  const Games = await GameModel.create(games);

  // generate venues
  const Venues = await VenueModel.create(venues);

  // generate bracket platforms
  const BracketPlatforms = await BracketPlatformModel.create(bracketPlatforms);

  // generate vod platforms
  const VodPlatforms = await VodPlatformModel.create(vodPlatforms);

  const players: Array<Player> = Array.from(
    {
      length: dataLengths.player,
    },
    generatePlayer,
  );
  const Players = await PlayerModel.create(players);

  // ADDING MAIN STRUCTS

  // generate events
  const events: Array<Event> = Array.from(
    {
      length: dataLengths.event,
    },
    (_, i) => {
      const venue: DocumentType<Venue> = Venues[i % Venues.length];
      return generateEvent(i, dataLengths.event, venue);
    },
  );
  const Events = await EventModel.create(events);

  // generate event social media
  const eventSocials: Array<EventSocial> = Events.map((event) =>
    generateEventSocial(event),
  );
  await EventSocialModel.create(eventSocials);

  // generate event series
  const eventSeries: Array<EventSeries> = Venues.map((venue) => ({
    name: `${venue.name} Event Series`,
    events: Events.filter(
      (event) => event.venue?.toString() === venue._id.toString(),
    ).map((event) => event._id),
    info: 'An event series',
  }));
  await EventSeriesModel.create(eventSeries);

  // generate tournaments with parameters:
  // total, 2 * events, 2 per event
  // 90% chance of single game, 10% chance of 2 - 4 games
  // random number of players (min 4, max 32)
  // <= 6 players ROUND_ROBIN, else 95% chance double elim, 5% single elim
  // 5% of tournaments are team based
  const tournaments: Array<Tournament> = Array.from(
    {
      length: dataLengths.event * 2,
    },
    (_, i) => {
      const event = Events[i % Events.length];

      const numPlayers = faker.random.number({
        min: 4,
        max: 32,
      });
      const players: Array<any> = sampleSize(Players, numPlayers).map(
        (player) => player._id,
      );

      const type =
        numPlayers <= 6
          ? TOURNAMENT_TYPE.ROUND_ROBIN
          : Math.random() < 0.95
          ? TOURNAMENT_TYPE.DOUBLE_ELIMINATION
          : TOURNAMENT_TYPE.SINGLE_ELIMINATION;

      const games: Array<any> =
        Math.random() < 0.9
          ? sampleSize(Games, 1).map((game) => game._id)
          : sampleSize(Games, faker.random.number({ min: 2, max: 4 })).map(
              (game) => game._id,
            );

      const is_team_based: boolean = Math.random() < 0.05;

      return {
        name: `Tournament #${i + 1}`,
        date_start: event.date_start,
        date_end: event.date_end,
        players,
        type,
        games,
        event: event._id,
        is_team_based,
      };
    },
  );
  const Tournaments = await TournamentModel.create(tournaments);

  // generate a bracket for each tournament
  const brackets = Array.from(
    {
      length: Tournaments.length,
    },
    (_, i) =>
      generateBracket(
        Tournaments[i],
        BracketPlatforms[i % BracketPlatforms.length],
      ),
  );
  await BracketModel.create(brackets);

  // create player socials
  const playerSocials: Array<PlayerSocial> = Players.map((player) =>
    generatePlayerSocial(player),
  );
  await PlayerSocialModel.create(playerSocials);

  // create player platforms
  const playerPlatforms: Array<PlayerPlatform> = Players.flatMap((player) =>
    BracketPlatforms.map((platform) => ({
      platform: platform._id,
      player: player._id,
      platform_id: faker.random.uuid(),
      email_hash: createHash('md5')
        .update(faker.internet.email())
        .digest('hex'),
    })),
  );
  await PlayerPlatformModel.create(playerPlatforms);

  // create tournament series
  const tournamentsByGame: Array<Array<DocumentType<Tournament>>> = values(
    groupBy(
      Tournaments.filter((tournament) => tournament.games.length === 1),
      (tournament) => tournament.games[0],
    ),
  );
  const tournamentSerieses: Array<TournamentSeries> = tournamentsByGame.map(
    (tbg) => ({
      name: `${
        Games.find((g) => g._id.toString() === tbg[0].games[0]?.toString())
          ?.name || ''
      } Tournament Series`,
      tournaments: tbg.map((t) => t._id),
      game: tbg[0].games[0],
      info: `Tournament Series for a game`,
    }),
  );
  const TournamentSerieses = await TournamentSeriesModel.create(
    tournamentSerieses,
  );

  // create random vods for a tournament
  const vods: Array<Vod> = Tournaments.filter(() => faker.random.boolean()).map(
    (tournament) => ({
      platform: sample(VodPlatforms)?._id,
      tournament: tournament._id,
      platform_id: faker.random.uuid(),
      url: faker.internet.url(),
      start_time: getOptional(
        faker.random
          .number({
            min: 0,
            max: 1000,
          })
          .toString(),
      ),
    }),
  );
  const Vods = await VodModel.create(vods);

  // results generation
  const results: Array<Result> = Tournaments.flatMap((tournament) => {
    // assign players to teams if required
    const players = tournament.is_team_based
      ? chunk(shuffle(tournament.players), 2)
      : chunk(shuffle(tournament.players), 1);

    return players.map((player, i) => ({
      tournament: tournament._id,
      players: player,
      rank: i + 1,
    }));
  });
  await ResultModel.create(results);

  // match generation, will not match results, for demo only
  const matches: Array<Match> = Tournaments.flatMap((tournament) => {
    // assign players to teams if required
    const players = tournament.is_team_based
      ? chunk(shuffle(tournament.players), 2)
      : chunk(shuffle(tournament.players), 1);

    // calculate rough number of matches in a tournament
    let num = 0;
    if (tournament.type === TOURNAMENT_TYPE.DOUBLE_ELIMINATION) {
      num = 2 * players.length - 1;
    } else if (tournament.type === TOURNAMENT_TYPE.SINGLE_ELIMINATION) {
      num = players.length - 1;
    } else if (tournament.type === TOURNAMENT_TYPE.ROUND_ROBIN) {
      num = (players.length / 2) * (players.length - 1);
    }

    // play some fake matches with meaningless data
    return Array.from(
      {
        length: num,
      },
      (): Match => {
        const matchPlayers = [sample(players), sample(players)];
        const matchScores = [faker.random.number(3), faker.random.number(3)];
        const winner = faker.random.boolean();

        return {
          tournament: tournament._id,
          player1: matchPlayers[0],
          player2: matchPlayers[1],
          score1: matchScores[0],
          score2: matchScores[1],
          winner: matchPlayers[winner ? 0 : 1],
          loser: matchPlayers[winner ? 1 : 0],
          round: faker.random.number({ min: -5, max: 5 }),
          round_name: faker.random.word(),
        };
      },
    );
  });
  const Matches = await MatchModel.create(matches);

  // generate random number of characters per game, 8-32 character
  const characters = Games.flatMap((game) =>
    Array.from({ length: faker.random.number({ min: 4, max: 32 }) }, () =>
      generateCharacter(game),
    ),
  );
  const Characters = await CharacterModel.create(characters);

  // generate random match vods, for a random number of matches
  const matchVods: Array<MatchVod> = compact(
    Matches.filter(faker.random.boolean).map((match) => {
      const tournament = Tournaments.find(
        (t) => t._id.toString() === match.tournament?.toString(),
      );
      if (tournament) {
        const vod = Vods.find(
          (v) => v.tournament?.toString() === tournament?._id.toString(),
        );
        if (vod) {
          const characters = Characters.filter(
            (character) =>
              character.game?.toString() === tournament?.games[0]?.toString(),
          );

          return {
            vod: vod?._id,
            match: match._id,
            characters: getOptional(
              sampleSize(
                characters,
                faker.random.number({ min: 1, max: 4 }),
              ).map((c) => c._id),
            ),
            timestamp: getOptional(
              faker.random.number({
                min: 100,
                max: 3000,
              }),
            ),
          };
        }
      }
      return null;
    }),
  );
  await MatchVodModel.create(matchVods);

  // generate random game elo for a random set of players, will not match actual results
  const gameElos: Array<GameElo> = Games.flatMap((game) => {
    const players = sampleSize(
      Players,
      faker.random.number({
        min: Math.round(Players.length * 0.2),
        max: Math.round(Players.length * 0.8),
      }),
    );
    return players.map(
      (player): GameElo => ({
        game: game._id,
        player: player._id,
        score: faker.random.number({
          min: 700,
          max: 1400,
        }),
      }),
    );
  });
  await GameEloModel.create(gameElos);

  // tournament series elo for random set of players, will not match actual results
  const tournamentSeriesElos: Array<TournamentSeriesElo> = TournamentSerieses.flatMap(
    (ts) => {
      const players = sampleSize(
        Players,
        faker.random.number({
          min: Math.round(Players.length * 0.4),
          max: Players.length,
        }),
      );

      return players.map(
        (player): TournamentSeriesElo => ({
          tournament_series: ts._id,
          player: player._id,
          score: faker.random.number({
            min: 700,
            max: 1400,
          }),
        }),
      );
    },
  );
  await TournamentSeriesEloModel.create(tournamentSeriesElos);

  // finally match elos, the true pain to do, so only doing a subset of matches
  const matchElos: Array<MatchElo> = Matches.filter(
    () => Math.random() < 0.25,
  ).flatMap(
    (match): Array<MatchElo> => [
      {
        match: match._id,
        player: match.player1?.[0],
        before: faker.random.number({
          min: 700,
          max: 1400,
        }),
        after: faker.random.number({
          min: 700,
          max: 1400,
        }),
      },
      {
        match: match._id,
        player: match.player2?.[0],
        before: faker.random.number({
          min: 700,
          max: 1400,
        }),
        after: faker.random.number({
          min: 700,
          max: 1400,
        }),
      },
    ],
  );
  await MatchEloModel.create(matchElos);

  return true;
};
