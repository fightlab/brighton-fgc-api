import { DocumentType } from '@typegoose/typegoose';
import { Tournament, TournamentModel } from '@models/tournament';
import { Event, EventModel } from '@models/event';
import { Game, GameModel } from '@models/game';
import { Player, PlayerModel } from '@models/player';
import {
  generateEvent,
  generateGame,
  generatePlayer,
  generateTournament,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';
import moment from 'moment';

describe('Tournament GraphQL Resolver Test', () => {
  let tournaments: Array<DocumentType<Tournament>>;
  let events: Array<DocumentType<Event>>;
  let games: Array<DocumentType<Game>>;
  let players: Array<DocumentType<Player>>;

  beforeEach(async () => {
    games = await GameModel.create(
      Array.from({ length: 2 }, () => generateGame()),
    );

    players = await PlayerModel.create(
      Array.from({ length: 8 }, () => generatePlayer()),
    );

    events = await EventModel.create(
      Array.from({ length: 2 }, () => generateEvent(new ObjectId())),
    );

    tournaments = await TournamentModel.create([
      generateTournament(
        events[0]._id,
        [games[0]._id],
        players.map((p) => p._id),
        false,
      ),
      generateTournament(
        events[1]._id,
        [games[1]._id],
        players.map((p) => p._id),
        true,
      ),
      generateTournament(
        events[0]._id,
        games.map((g) => g._id),
        players.map((p) => p._id),
        true,
      ),
      generateTournament(
        events[1]._id,
        [],
        players.map((p) => p._id),
        true,
      ),
      generateTournament(
        events[1]._id,
        games.map((g) => g._id),
        [],
        true,
      ),
    ] as Array<Tournament>);
  });

  it('should return all tournaments', async () => {
    const source = gql`
      # Write your query or mutation here
      query QueryTournaments {
        tournaments {
          _id
          name
          date_start
          date_end
          type
          event_id
          game_ids
          player_ids
          is_team_based
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    expect(
      every(
        output.data?.tournaments,
        (e) =>
          some(tournaments, (s) => s.id === e._id) &&
          some(tournaments, (s) => s.name === e.name) &&
          some(tournaments, (s) => s.type === e.type) &&
          some(tournaments, (s) => s.event?.toString() === e.event_id) &&
          some(
            tournaments,
            (s) => s.date_start.toISOString() === e.date_start,
          ) &&
          some(
            tournaments,
            (s) => (s.date_end?.toISOString() ?? null) === e.date_end,
          ) &&
          some(
            tournaments,
            (s) => (s.is_team_based ?? null) === e.is_team_based,
          ) &&
          e.game_ids.length >= 0 &&
          e.player_ids.length >= 0,
      ),
    ).toBe(true);
  });

  it('should return a single tournament by id', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: tournaments[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[1].id);
    expect(output.data?.tournament.name).toBe(tournaments[1].name);
  });

  it('should return null if tournament by id not found', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeNull();
  });

  it('should populate event for a given tournament', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          event {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournaments[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.tournament.event).toBeDefined();
    expect(output.data?.tournament.event._id).toBe(events[0].id);
    expect(output.data?.tournament.event.name).toBe(events[0].name);
  });

  it('should populate games for a given tournament', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          games {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournaments[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.tournament.games).toBeDefined();
    expect(output.data?.tournament.games).toHaveLength(1);
    expect(output.data?.tournament.games[0]._id).toBe(games[0].id);
    expect(output.data?.tournament.games[0].name).toBe(games[0].name);
  });

  it('should populate multiple games in a tournament', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          games {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournaments[2].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[2].id);
    expect(output.data?.tournament.games).toBeDefined();
    expect(output.data?.tournament.games).toHaveLength(2);

    expect(
      every(
        output.data?.tournament.games,
        (e) =>
          some(games, (s) => s.id === e._id) &&
          some(games, (s) => s.name === e.name),
      ),
    ).toBe(true);
  });

  it('should return empty array of games not found in a tournament', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          games {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournaments[3].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[3].id);
    expect(output.data?.tournament.games).toBeDefined();
    expect(output.data?.tournament.games).toHaveLength(0);
  });

  it('should populate players for a given tournament', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          players {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: tournaments[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.tournament.players).toBeDefined();
    expect(output.data?.tournament.players).toHaveLength(8);

    expect(
      every(
        output.data?.tournament.players,
        (e) =>
          some(players, (s) => s.id === e._id) &&
          some(players, (s) => s.handle === e.handle),
      ),
    ).toBe(true);
  });

  it('should return empty array of players if no players in a tournament', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          players {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: tournaments[4].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[4].id);
    expect(output.data?.tournament.players).toBeDefined();
    expect(output.data?.tournament.players).toHaveLength(0);
  });

  it('should sort tournaments by name asc', async () => {
    const source = gql`
      query QueryTournaments {
        tournaments(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((t) => t.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(expected.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by name desc', async () => {
    const source = gql`
      query QueryTournaments {
        tournaments(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((t) => t.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(expected.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by date start asc', async () => {
    const source = gql`
      query SelectTournaments {
        tournaments(sort: DATE_START_ASC) {
          _id
          date_start
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((e) => e.date_start.toISOString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.date_start);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by date start desc', async () => {
    const source = gql`
      query SelectTournaments {
        tournaments(sort: DATE_START_DESC) {
          _id
          date_start
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((e) => e.date_start.toISOString()),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.date_start);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by date end asc', async () => {
    const source = gql`
      query SelectTournaments {
        tournaments(sort: DATE_END_ASC) {
          _id
          date_end
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((e) => e.date_end?.toISOString() ?? null),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.date_end);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by date end desc', async () => {
    const source = gql`
      query SelectTournaments {
        tournaments(sort: DATE_END_DESC) {
          _id
          date_end
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((e) => e.date_end?.toISOString() ?? null),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.date_end);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by event id', async () => {
    const source = gql`
      query SelectTournaments {
        tournaments(sort: EVENT_ID) {
          _id
          event_id
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((e) => e.event?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p.event_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournaments by id', async () => {
    const source = gql`
      query SelectTournaments {
        tournaments(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      tournaments.map((e) => e._id.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    const dataFromQuery: Array<any> = output.data?.tournaments;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search tournaments by their name', async () => {
    const source = gql`
      query SelectTournaments($search: String!) {
        tournaments(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: tournaments[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(1);
    expect(output.data?.tournaments[0]._id).toBe(tournaments[0].id);
    expect(output.data?.tournaments[0].name).toBe(tournaments[0].name);
  });

  it('should empty array if tournaments not found by name', async () => {
    const source = gql`
      query SelectTournaments($search: String!) {
        tournaments(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: 'egf iughqouifghiuqgfiuqgfiuqgiuf',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should get tournaments by list of ids', async () => {
    const source = gql`
      query SelectTournaments($ids: [ObjectId!]) {
        tournaments(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: tournaments.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);
  });

  it('should empty array if tournaments not found for a list of ids', async () => {
    const source = gql`
      query SelectTournaments($ids: [ObjectId!]) {
        tournaments(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return tournaments between 2 start dates', async () => {
    // choose a date before a known tournament
    const dateStartIsAfter = moment
      .utc(tournaments[0].date_start)
      .subtract(1, 'd');

    // choose a date after a known tournament
    const dateStartIsBefore = moment.utc(tournaments[0].date_start).add(1, 'd');

    const source = gql`
      query SelectTournaments(
        $date_start_gte: DateTime!
        $date_start_lte: DateTime!
      ) {
        tournaments(
          date_start_gte: $date_start_gte
          date_start_lte: $date_start_lte
        ) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.tournaments, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return (
          dateStartAsMoment.isAfter(dateStartIsAfter) &&
          dateStartAsMoment.isBefore(dateStartIsBefore)
        );
      }),
    ).toBe(true);
  });

  it('should return tournaments between 2 end dates', async () => {
    // choose a date before a known tournament
    const dateEndIsAfter = moment.utc(tournaments[0].date_end).subtract(1, 'd');

    // choose a date after a known tournament
    const dateEndIsBefore = moment.utc(tournaments[0].date_end).add(1, 'd');

    const source = gql`
      query SelectTournaments(
        $date_end_gte: DateTime!
        $date_end_lte: DateTime!
      ) {
        tournaments(date_end_gte: $date_end_gte, date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.tournaments, (e) => {
        const dateStartAsMoment = moment(e.date_end);
        return (
          dateStartAsMoment.isAfter(dateEndIsAfter) &&
          dateStartAsMoment.isBefore(dateEndIsBefore)
        );
      }),
    ).toBe(true);
  });

  it('should return empty array if no tournaments found between start dates', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateStartIsAfter = moment.utc('2000-01-01');

    // choose a date also far in the past, but after the isAfter
    const dateStartIsBefore = moment.utc('2000-01-02');

    const source = gql`
      query SelectTournaments(
        $date_start_gte: DateTime!
        $date_start_lte: DateTime!
      ) {
        tournaments(
          date_start_gte: $date_start_gte
          date_start_lte: $date_start_lte
        ) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return empty array if no tournaments found between end dates', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateEndIsAfter = moment.utc('2000-01-01');

    // choose a date also far in the past, but after the isAfter
    const dateEndIsBefore = moment.utc('2000-01-02');

    const source = gql`
      query SelectTournaments(
        $date_end_gte: DateTime!
        $date_end_lte: DateTime!
      ) {
        tournaments(date_end_gte: $date_end_gte, date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return tournaments greater than a start date', async () => {
    // choose a date before a known tournament
    const dateStartIsAfter = moment
      .utc(tournaments[0].date_start)
      .subtract(1, 'd');

    const source = gql`
      query SelectTournaments($date_start_gte: DateTime!) {
        tournaments(date_start_gte: $date_start_gte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.tournaments, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return dateStartAsMoment.isAfter(dateStartIsAfter);
      }),
    ).toBe(true);
  });

  it('should return tournaments greater than a end date', async () => {
    // choose a date before a known tournament
    const dateEndIsAfter = moment.utc(tournaments[0].date_end).subtract(1, 'd');

    const source = gql`
      query SelectTournaments($date_end_gte: DateTime!) {
        tournaments(date_end_gte: $date_end_gte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.tournaments, (e) => {
        const dateStartAsMoment = moment(e.date_end);
        return dateStartAsMoment.isAfter(dateEndIsAfter);
      }),
    ).toBe(true);
  });

  it('should return tournaments less than a start date', async () => {
    // choose a date after a known tournament
    const dateStartIsBefore = moment.utc(tournaments[0].date_start).add(1, 'd');

    const source = gql`
      query SelectTournaments($date_start_lte: DateTime!) {
        tournaments(date_start_lte: $date_start_lte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.tournaments, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return dateStartAsMoment.isBefore(dateStartIsBefore);
      }),
    ).toBe(true);
  });

  it('should return tournaments less than a end date', async () => {
    // choose a date after a known tournament
    const dateEndIsBefore = moment.utc(tournaments[0].date_end).add(1, 'd');

    const source = gql`
      query SelectTournaments($date_end_lte: DateTime!) {
        tournaments(date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.tournaments, (e) => {
        const dateStartAsMoment = moment(e.date_end);
        return dateStartAsMoment.isBefore(dateEndIsBefore);
      }),
    ).toBe(true);
  });

  it('should return empty array if no tournaments found greater than a start date', async () => {
    // choose a date in far in the future, the year 3000 is a good bet ;)
    const dateStartIsAfter = moment.utc('3000-01-01');

    const source = gql`
      query SelectTournaments($date_start_gte: DateTime!) {
        tournaments(date_start_gte: $date_start_gte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return empty array if no tournaments found greater than a end date', async () => {
    // choose a date in far in the future, the year 3000 is a good bet ;)
    const dateEndIsAfter = moment.utc('3000-01-01');

    const source = gql`
      query SelectTournaments($date_end_gte: DateTime!) {
        tournaments(date_end_gte: $date_end_gte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return empty array if no tournaments found less than a start date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateStartIsBefore = moment.utc('2000-01-01');

    const source = gql`
      query SelectTournaments($date_start_lte: DateTime!) {
        tournaments(date_start_lte: $date_start_lte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return empty array if no tournaments found less than a end date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateEndIsBefore = moment.utc('2000-01-01');

    const source = gql`
      query SelectTournaments($date_end_lte: DateTime!) {
        tournaments(date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some tournaments
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return tournaments for a given event', async () => {
    const source = gql`
      query QueryTournaments($event: ObjectId!) {
        tournaments(event: $event) {
          _id
          name
          event_id
        }
      }
    `;

    const variableValues = {
      event: events[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(
      tournaments.filter((t) => t.event?.toString() === events[0].id).length,
    );
  });

  it('should return empty array if event not found', async () => {
    const source = gql`
      query QueryTournaments($event: ObjectId!) {
        tournaments(event: $event) {
          _id
          name
          event_id
        }
      }
    `;

    const variableValues = {
      event: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return tournaments for a given game', async () => {
    const source = gql`
      query QueryTournaments($games: [ObjectId!]) {
        tournaments(games: $games) {
          _id
          name
          game_ids
        }
      }
    `;

    const variableValues = {
      games: [games[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(
      tournaments.filter(
        (t) => !!t.games.find((g) => g?.toString() === games[0].id),
      ).length,
    );
  });

  it('should return empty array if game not found', async () => {
    const source = gql`
      query QueryTournaments($games: [ObjectId!]) {
        tournaments(games: $games) {
          _id
          name
          game_ids
        }
      }
    `;

    const variableValues = {
      games: [new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return tournaments for a given player', async () => {
    const source = gql`
      query QueryTournaments($players: [ObjectId!]) {
        tournaments(players: $players) {
          _id
          name
          game_ids
        }
      }
    `;

    const variableValues = {
      players: [players[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(
      tournaments.filter(
        (t) => !!t.players.find((g) => g?.toString() === players[0].id),
      ).length,
    );
  });

  it('should return empty array if player not found', async () => {
    const source = gql`
      query QueryTournaments($players: [ObjectId!]) {
        tournaments(players: $players) {
          _id
          name
          game_ids
        }
      }
    `;

    const variableValues = {
      players: [new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(0);
  });

  it('should return tournaments for a given tournament type', async () => {
    const source = gql`
      query QueryTournaments($type: TournamentType!) {
        tournaments(type: $type) {
          _id
          name
          game_ids
        }
      }
    `;

    const variableValues = {
      type: 'DOUBLE_ELIMINATION',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);
  });

  it('should return empty array if no tournaments for a tournament type', async () => {
    const source = gql`
      query QueryTournaments($type: TournamentType!) {
        tournaments(type: $type) {
          _id
          name
          game_ids
        }
      }
    `;

    const variableValues = {
      type: 'ROUND_ROBIN',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(0);
  });
});
