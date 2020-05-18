// USED FOR TESTING AND EARLY DEVELOPMENT ONLY
// TO GENERATE FAKE DATA FOR MONGOOSE
// WARNING WILL REMOVE ALL DATA FROM MONGO ON STARTUP AND SEED IT, IF SEED_DB IS SET

import faker from 'faker';
import mongoose from '@lib/mongoose';
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
import { IBracketPlatform, BracketPlatform } from '@models/bracket_platform';
import { IBracket, Bracket } from '@models/bracket';
import { ICharacter, Character } from '@models/character';
import { IEventSeries, EventSeries } from '@models/event_series';
import { IEventSocial, EventSocial } from '@models/event_social';
import { IEvent, Event } from '@models/event';
import { IGameElo, GameElo } from '@models/game_elo';
import { IGame, Game } from '@models/game';
import { IMatchElo, MatchElo } from '@models/match_elo';
import { IMatchVod, MatchVod } from '@models/match_vod';
import { IMatch, Match } from '@models/match';
import { IPlayerPlatform, PlayerPlatform } from '@models/player_platform';
import { IPlayerSocial, PlayerSocial } from '@models/player_social';
import { IPlayer, Player } from '@models/player';
import { IResult, Result } from '@models/result';
import {
  TournamentSeriesElo,
  ITournamentSeriesElo,
} from '@models/tournament_series_elo';
import { ITournamentSeries, TournamentSeries } from '@models/tournament_series';
import { ITournament, TOURNAMENT_TYPE, Tournament } from '@models/tournament';
import { IVenue, Venue } from '@models/venue';
import { IVodPlatform, VodPlatform } from '@models/vod_platform';
import { IVod, Vod } from '@models/vod';

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

// bracket
const generateBracket = (
  tournament: Tournament,
  platform: BracketPlatform,
): IBracket => {
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
const generateEventSocial = (event: Event): IEventSocial => ({
  event: event._id,
  facebook: getOptional(faker.internet.url),
  web: getOptional(faker.internet.url),
  twitter: getOptional(faker.internet.url),
  discord: getOptional(faker.internet.url),
  instagram: getOptional(faker.internet.url),
  twitch: getOptional(faker.internet.url),
  youtube: getOptional(faker.internet.url),
  meta: getOptional(faker.internet.url),
});

// player social mock
const generatePlayerSocial = (player: Player): IPlayerSocial => ({
  player: player._id,
  facebook: getOptional(faker.internet.userName()),
  web: getOptional(faker.internet.userName()),
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
const generateCharacter = (game: Game): ICharacter => ({
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
  const games: Array<IGame> = Array.from({ length: dataLengths.game }, (_, i) =>
    generateGame(i),
  );
  // add games to db
  const Games = await Game.create(games);

  // generate venues
  const Venues = await Venue.create(venues);

  // generate bracket platforms
  const BracketPlatforms = await BracketPlatform.create(bracketPlatforms);

  // generate vod platforms
  const VodPlatforms = await VodPlatform.create(vodPlatforms);

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

  // generate event social media
  const eventSocials: Array<IEventSocial> = Events.map((event) =>
    generateEventSocial(event),
  );
  await EventSocial.create(eventSocials);

  // generate event series
  const eventSeries: Array<IEventSeries> = Venues.map((venue) => ({
    name: `${venue.name} Event Series`,
    events: Events.filter(
      (event) => event.venue.toString() === venue._id.toString(),
    ).map((event) => event._id),
    info: 'An event series',
  }));
  await EventSeries.create(eventSeries);

  // generate tournaments with parameters:
  // total, 2 * events, 2 per event
  // 90% chance of single game, 10% chance of 2 - 4 games
  // random number of players (min 4, max 32)
  // <= 6 players ROUND_ROBIN, else 95% chance double elim, 5% single elim
  // 5% of tournaments are team based
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
          : Math.random() < 0.95
          ? TOURNAMENT_TYPE.DOUBLE_ELIMINATION
          : TOURNAMENT_TYPE.SINGLE_ELIMINATION;

      const games: Array<Game['_id']> =
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
  const Tournaments = await Tournament.create(tournaments);

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
  await Bracket.create(brackets);

  // create player socials
  const playerSocials: Array<IPlayerSocial> = Players.map((player) =>
    generatePlayerSocial(player),
  );
  await PlayerSocial.create(playerSocials);

  // create player platforms
  const playerPlatforms: Array<IPlayerPlatform> = Players.flatMap((player) =>
    BracketPlatforms.map((platform) => ({
      platform: platform._id,
      player: player._id,
      platform_id: faker.random.uuid(),
      email_hash: createHash('md5')
        .update(faker.internet.email())
        .digest('hex'),
    })),
  );
  await PlayerPlatform.create(playerPlatforms);

  // create tournament series
  const tournamentsByGame: Array<Array<Tournament>> = values(
    groupBy(
      Tournaments.filter((tournament) => tournament.games.length === 1),
      (tournament) => tournament.games[0],
    ),
  );
  const tournamentSerieses: Array<ITournamentSeries> = tournamentsByGame.map(
    (tbg) => ({
      name: `${
        Games.find((g) => g._id.toString() === tbg[0].games[0].toString())
          ?.name || ''
      } Tournament Series`,
      tournaments: tbg.map((t) => t._id),
      game: tbg[0].games[0],
      info: `Tournament Series for a game`,
    }),
  );
  const TournamentSerieses = await TournamentSeries.create(tournamentSerieses);

  // create random vods for a tournament
  const vods: Array<IVod> = Tournaments.filter(() =>
    faker.random.boolean(),
  ).map((tournament) => ({
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
  }));
  const Vods = await Vod.create(vods);

  // results generation
  const results: Array<IResult> = Tournaments.flatMap((tournament) => {
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
  await Result.create(results);

  // match generation, will not match results, for demo only
  const matches: Array<IMatch> = Tournaments.flatMap((tournament) => {
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
      (): IMatch => {
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
  const Matches = await Match.create(matches);

  // generate random number of characters per game, 8-32 character
  const characters = Games.flatMap((game) =>
    Array.from({ length: faker.random.number({ min: 4, max: 32 }) }, () =>
      generateCharacter(game),
    ),
  );
  const Characters = await Character.create(characters);

  // generate random match vods, for a random number of matches
  const matchVods: Array<IMatchVod> = compact(
    Matches.filter(faker.random.boolean).map((match) => {
      const tournament = Tournaments.find(
        (t) => t._id.toString() === match.tournament.toString(),
      );
      if (tournament) {
        const vod = Vods.find(
          (v) => v.tournament.toString() === tournament?._id.toString(),
        );
        if (vod) {
          const characters = Characters.filter(
            (character) =>
              character.game.toString() === tournament?.games[0].toString(),
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
  await MatchVod.create(matchVods);

  // generate random game elo for a random set of players, will not match actual results
  const gameElos: Array<IGameElo> = Games.flatMap((game) => {
    const players = sampleSize(
      Players,
      faker.random.number({
        min: Math.round(Players.length * 0.2),
        max: Math.round(Players.length * 0.8),
      }),
    );
    return players.map(
      (player): IGameElo => ({
        game: game._id,
        player: player._id,
        score: faker.random.number({
          min: 700,
          max: 1400,
        }),
      }),
    );
  });
  await GameElo.create(gameElos);

  // tournament series elo for random set of players, will not match actual results
  const tournamentSeriesElos: Array<ITournamentSeriesElo> = TournamentSerieses.flatMap(
    (ts) => {
      const players = sampleSize(
        Players,
        faker.random.number({
          min: Math.round(Players.length * 0.4),
          max: Players.length,
        }),
      );

      return players.map(
        (player): ITournamentSeriesElo => ({
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
  await TournamentSeriesElo.create(tournamentSeriesElos);

  // finally match elos, the true pain to do, so only doing a subset of matches
  const matchElos: Array<IMatchElo> = Matches.filter(
    () => Math.random() < 0.25,
  ).flatMap(
    (match): Array<IMatchElo> => [
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
    ],
  );
  await MatchElo.create(matchElos);

  return true;
};
