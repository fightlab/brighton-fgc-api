import { DocumentType } from '@typegoose/typegoose';
import { Tournament, TournamentModel } from '@models/tournament';
import { Player, PlayerModel } from '@models/player';
import { Match, MatchModel } from '@models/match';
import {
  generateTournament,
  generatePlayer,
  generateMatch,
  generateMatchElo,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { sample, every, some, orderBy, isEqual } from 'lodash';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import moment from 'moment';
import { MatchEloModel } from '@models/match_elo';

describe('Match GraphQl Resolver Test', () => {
  let players: Array<DocumentType<Player>>;
  let tournaments: Array<DocumentType<Tournament>>;
  let matches: Array<DocumentType<Match>>;

  beforeEach(async () => {
    players = await PlayerModel.create(
      Array.from(
        {
          length: 8,
        },
        () => generatePlayer(true),
      ),
    );

    tournaments = await TournamentModel.create(
      Array.from(
        {
          length: 2,
        },
        () =>
          generateTournament(
            new ObjectId(),
            [new ObjectId()],
            players.map((p) => p._id),
            true,
          ),
      ),
    );

    // ok generate a bunch of matches we can roughly test
    matches = await MatchModel.create(
      tournaments.flatMap((tournament, i) =>
        players.flatMap((player) =>
          generateMatch(
            tournament._id,
            [player._id],
            [sample(players)?._id],
            i !== 0,
          ),
        ),
      ),
    );
  });

  it('should return all matches', async () => {
    const source = gql`
      query QueryMatches {
        matches {
          _id
          tournament_id
          player1_ids
          player2_ids
          winner_ids
          loser_ids
          score1
          score2
          round
          round_name
          date_start
          date_end
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);
    expect(
      every(
        output.data?.matches,
        (e) =>
          some(matches, (s) => s.id === e._id) &&
          some(matches, (s) => s.tournament?.toString() === e.tournament_id) &&
          some(matches, (s) => (s.score1 ?? null) === e.score1) &&
          some(matches, (s) => (s.score2 ?? null) === e.score2) &&
          some(matches, (s) => (s.round ?? null) === e.round) &&
          some(matches, (s) => (s.round_name ?? null) === e.round_name) &&
          some(
            matches,
            (s) => (s.date_end ?? null)?.toISOString() ?? null === e.date_end,
          ) &&
          some(
            matches,
            (s) =>
              (s.date_start ?? null)?.toISOString() ?? null === e.date_start,
          ) &&
          e.player1_ids.length >= 0 &&
          e.player2_ids.length >= 0 &&
          e.winner_ids.length >= 0 &&
          e.loser_ids.length >= 0,
      ),
    ).toBe(true);
  });

  it('should return single match by id', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          tournament_id
          player1_ids
          player2_ids
          winner_ids
          loser_ids
          score1
          score2
          round
          round_name
          date_start
          date_end
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match._id).toBe(matches[0].id);
    expect(output.data?.match.tournament_id).toBe(
      matches[0].tournament?.toString(),
    );
    expect(output.data?.match.tournament_id).toBe(tournaments[0].id);
    expect(output.data?.match.player1_ids).toHaveLength(1);
    expect(output.data?.match.player1_ids[0]).toBe(
      matches[0].player1?.[0]?.toString(),
    );
    expect(output.data?.match.player1_ids[0]).toBe(players[0].id);
    expect(output.data?.match.player2_ids).toHaveLength(1);
    expect(output.data?.match.player2_ids[0]).toBe(
      matches[0].player2?.[0]?.toString(),
    );
    expect(output.data?.match.winner_ids).toHaveLength(1);
    expect(output.data?.match.winner_ids[0]).toBe(
      matches[0].winner?.[0]?.toString(),
    );
    expect(output.data?.match.loser_ids).toHaveLength(1);
    expect(output.data?.match.loser_ids[0]).toBe(
      matches[0].loser?.[0]?.toString(),
    );
    expect(output.data?.match.score1).toBe(matches[0].score1);
    expect(output.data?.match.score2).toBe(matches[0].score2);
    expect(output.data?.match.round).toBe(matches[0].round);
    expect(output.data?.match.round_name).toBe(matches[0].round_name);
    expect(output.data?.match.date_start).toBe(
      matches[0].date_start?.toISOString(),
    );
    expect(output.data?.match.date_end).toBe(
      matches[0].date_end?.toISOString(),
    );
  });

  it('should return null if match not found by id', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
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
    expect(output.data?.match).toBeNull();
  });

  // populate
  it('should populate tournament', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          tournament_id
          tournament {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match._id).toBe(matches[0].id);
    expect(output.data?.match.tournament_id).toBe(
      matches[0].tournament?.toString(),
    );
    expect(output.data?.match.tournament).toBeDefined();
    expect(output.data?.match.tournament._id).toBe(
      matches[0].tournament?.toString(),
    );
    expect(output.data?.match.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.match.tournament.name).toBe(tournaments[0].name);
  });

  it('should populate player1', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player1_ids
          player1 {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.player1_ids).toHaveLength(1);
    expect(output.data?.match.player1).toHaveLength(1);
    expect(output.data?.match.player1[0]._id).toBe(
      matches[0].player1?.[0]?.toString(),
    );
    expect(output.data?.match.player1[0]._id).toBe(players[0].id);
    expect(output.data?.match.player1[0].handle).toBe(players[0].handle);
  });

  it('should return empty array if player1 is empty', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player1_ids
          player1 {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[matches.length - 1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.player1_ids).toHaveLength(0);
    expect(output.data?.match.player1).toHaveLength(0);
  });

  it('should populate player2', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player2_ids
          player2 {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.player2_ids).toHaveLength(1);
    expect(output.data?.match.player2).toHaveLength(1);
    expect(output.data?.match.player2[0]._id).toBe(
      matches[0].player2?.[0]?.toString(),
    );
    expect(output.data?.match.player2[0]._id).toBe(
      players.find((p) => p.id === matches[0].player2?.[0]?.toString())?.id,
    );
    expect(output.data?.match.player2[0].handle).toBe(
      players.find((p) => p.id === matches[0].player2?.[0]?.toString())?.handle,
    );
  });

  it('should return empty array if player2 is empty', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player2_ids
          player2 {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[matches.length - 1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.player2_ids).toHaveLength(0);
    expect(output.data?.match.player2).toHaveLength(0);
  });

  it('should populate winner', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          winner_ids
          winner {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.winner_ids).toHaveLength(1);
    expect(output.data?.match.winner).toHaveLength(1);
    expect(output.data?.match.winner[0]._id).toBe(
      matches[0].winner?.[0]?.toString(),
    );
    expect(output.data?.match.winner[0]._id).toBe(
      players.find((p) => p.id === matches[0].winner?.[0]?.toString())?.id,
    );
    expect(output.data?.match.winner[0].handle).toBe(
      players.find((p) => p.id === matches[0].winner?.[0]?.toString())?.handle,
    );
  });

  it('should return empty array if winner is empty', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          winner_ids
          winner {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[matches.length - 1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.winner_ids).toHaveLength(0);
    expect(output.data?.match.winner).toHaveLength(0);
  });

  it('should populate loser', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          loser_ids
          loser {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.loser_ids).toHaveLength(1);
    expect(output.data?.match.loser).toHaveLength(1);
    expect(output.data?.match.loser[0]._id).toBe(
      matches[0].loser?.[0]?.toString(),
    );
    expect(output.data?.match.loser[0]._id).toBe(
      players.find((p) => p.id === matches[0].loser?.[0]?.toString())?.id,
    );
    expect(output.data?.match.loser[0].handle).toBe(
      players.find((p) => p.id === matches[0].loser?.[0]?.toString())?.handle,
    );
  });

  it('should return empty array if loser is empty', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          loser_ids
          loser {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: matches[matches.length - 1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match.loser_ids).toHaveLength(0);
    expect(output.data?.match.loser).toHaveLength(0);
  });

  it('should sort matches by date start asc', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: DATE_START_ASC) {
          _id
          date_start
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.date_start?.toISOString() ?? null),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.date_start);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by date start desc', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: DATE_START_DESC) {
          _id
          date_start
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.date_start?.toISOString() ?? null),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.date_start);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by date end asc', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: DATE_END_ASC) {
          _id
          date_end
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.date_end?.toISOString() ?? null),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.date_end);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by date end desc', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: DATE_END_DESC) {
          _id
          date_end
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.date_end?.toISOString() ?? null),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.date_end);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by round asc', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: ROUND_ASC) {
          _id
          round
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.round ?? null),
      [(v) => (v ? Math.abs(v) : null)],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.round);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by round desc', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: ROUND_DESC) {
          _id
          round
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.round ?? null),
      [(v) => (v ? Math.abs(v) : null)],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.round);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by tournament id', async () => {
    const source = gql`
      query QueryMatches {
        matches(sort: TOURNAMENT_ID) {
          _id
          tournament_id
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.tournament?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p.tournament_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort matches by id', async () => {
    const source = gql`
      query SelectMatches {
        matches(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      matches.map((e) => e.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(matches.length);

    const dataFromQuery: Array<any> = output.data?.matches;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  //  search
  it('should get list of matches by ids', async () => {
    const source = gql`
      query QueryMatches($ids: [ObjectId!]) {
        matches(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [matches[0].id, matches[1].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(2);
    expect(
      every(
        output.data?.matches,
        (e) => e._id === matches[0].id || e._id === matches[1].id,
      ),
    );
  });

  it('should return empty array if not found by ids', async () => {
    const source = gql`
      query QueryMatches($ids: [ObjectId!]) {
        matches(ids: $ids) {
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
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should get list of matches by players', async () => {
    const source = gql`
      query QueryMatches($players: [ObjectId!]) {
        matches(players: $players) {
          _id
          player1_ids
          player2_ids
        }
      }
    `;

    const variableValues = {
      players: [players[0].id, players[1].id],
    };

    const expectedLength = matches.filter(
      (m) =>
        !!m.player1?.find((p) => p?.toString() === players[0].id) ||
        !!m.player1?.find((p) => p?.toString() === players[1].id) ||
        !!m.player2?.find((p) => p?.toString() === players[0].id) ||
        !!m.player2?.find((p) => p?.toString() === players[1].id),
    ).length;

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(expectedLength);
  });

  it('should return empty array if not found by players', async () => {
    const source = gql`
      query QueryMatches($players: [ObjectId!]) {
        matches(players: $players) {
          _id
          player1_ids
          player2_ids
        }
      }
    `;

    const variableValues = {
      players: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should get list of matches by winners', async () => {
    const source = gql`
      query QueryMatches($winners: [ObjectId!]) {
        matches(winners: $winners) {
          _id
          winner_ids
        }
      }
    `;

    const variableValues = {
      winners: [players[0].id, players[1].id],
    };

    const expectedLength = matches.filter(
      (m) =>
        !!m.winner?.find((p) => p?.toString() === players[0].id) ||
        !!m.winner?.find((p) => p?.toString() === players[1].id),
    ).length;

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(expectedLength);
  });

  it('should return empty array if not found by winners', async () => {
    const source = gql`
      query QueryMatches($winners: [ObjectId!]) {
        matches(winners: $winners) {
          _id
          winner_ids
        }
      }
    `;

    const variableValues = {
      winners: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should get list of matches by losers', async () => {
    const source = gql`
      query QueryMatches($losers: [ObjectId!]) {
        matches(losers: $losers) {
          _id
          loser_ids
        }
      }
    `;

    const variableValues = {
      losers: [players[0].id, players[1].id],
    };

    const expectedLength = matches.filter(
      (m) =>
        !!m.loser?.find((p) => p?.toString() === players[0].id) ||
        !!m.loser?.find((p) => p?.toString() === players[1].id),
    ).length;

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(expectedLength);
  });

  it('should return empty array if not found by losers', async () => {
    const source = gql`
      query QueryMatches($losers: [ObjectId!]) {
        matches(losers: $losers) {
          _id
          loser_ids
        }
      }
    `;

    const variableValues = {
      losers: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should get list of matches by tournaments', async () => {
    const source = gql`
      query QueryMatches($tournaments: [ObjectId!]) {
        matches(tournaments: $tournaments) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournaments: [tournaments[0].id],
    };

    const expectedLength = matches.filter(
      (m) => m.tournament?.toString() === tournaments[0].id,
    ).length;

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(expectedLength);
  });

  it('should return empty array if not found by tournaments', async () => {
    const source = gql`
      query QueryMatches($tournaments: [ObjectId!]) {
        matches(tournaments: $tournaments) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournaments: [new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should get list of matches by round name', async () => {
    const source = gql`
      query QueryMatches($round_name: String!) {
        matches(round_name: $round_name) {
          _id
          round_name
        }
      }
    `;

    const variableValues = {
      round_name: matches[0].round_name,
    };

    const expectedLength = matches.filter(
      (m) => m.round_name === matches[0].round_name,
    ).length;

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(expectedLength);
  });

  it('should return empty array if not found by round name', async () => {
    const source = gql`
      query QueryMatches($round_name: String!) {
        matches(round_name: $round_name) {
          _id
          round_name
        }
      }
    `;

    const variableValues = {
      round_name: 'lmao imagine this being a round name',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return matches by round number', async () => {
    const source = gql`
      query QueryMatches($round: Float!) {
        matches(round: $round) {
          _id
          round
        }
      }
    `;

    const variableValues = {
      round: matches[0].round,
    };

    const expectedLength = matches.filter((m) => m.round === matches[0].round)
      .length;

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(expectedLength);
  });

  it('should return empty array if not found by round', async () => {
    const source = gql`
      query QueryMatches($round: Float!) {
        matches(round: $round) {
          _id
          round
        }
      }
    `;

    const variableValues = {
      round: 99,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return matches between 2 start dates', async () => {
    // choose a date before a known tournament
    const dateStartIsAfter = moment.utc(matches[0].date_start).subtract(1, 'm');

    // choose a date after a known tournament
    const dateStartIsBefore = moment.utc(matches[0].date_start).add(1, 'm');

    const source = gql`
      query SelectMatches(
        $date_start_gte: DateTime!
        $date_start_lte: DateTime!
      ) {
        matches(
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
    // should find some matches
    expect(output.data?.matches.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.matches, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return (
          dateStartAsMoment.isAfter(dateStartIsAfter) &&
          dateStartAsMoment.isBefore(dateStartIsBefore)
        );
      }),
    ).toBe(true);
  });

  it('should return matches between 2 end dates', async () => {
    // choose a date before a known tournament
    const dateEndIsAfter = moment.utc(matches[0].date_end).subtract(1, 'm');

    // choose a date after a known tournament
    const dateEndIsBefore = moment.utc(matches[0].date_end).add(1, 'm');

    const source = gql`
      query SelectMatches($date_end_gte: DateTime!, $date_end_lte: DateTime!) {
        matches(date_end_gte: $date_end_gte, date_end_lte: $date_end_lte) {
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
    // should find some matches
    expect(output.data?.matches.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.matches, (e) => {
        const dateStartAsMoment = moment(e.date_end);
        return (
          dateStartAsMoment.isAfter(dateEndIsAfter) &&
          dateStartAsMoment.isBefore(dateEndIsBefore)
        );
      }),
    ).toBe(true);
  });

  it('should return empty array of matches if not found between 2 start dates', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateStartIsAfter = moment.utc('2000-01-01');

    // choose a date also far in the past, but after the isAfter
    const dateStartIsBefore = moment.utc('2000-01-02');

    const source = gql`
      query SelectMatches(
        $date_start_gte: DateTime!
        $date_start_lte: DateTime!
      ) {
        matches(
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
    // should find some matches
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return empty array of matches if not found between 2 end dates', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateEndIsAfter = moment.utc('2000-01-01');

    // choose a date also far in the past, but after the isAfter
    const dateEndIsBefore = moment.utc('2000-01-02');

    const source = gql`
      query SelectMatches($date_end_gte: DateTime!, $date_end_lte: DateTime!) {
        matches(date_end_gte: $date_end_gte, date_end_lte: $date_end_lte) {
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
    // should find some matches
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return matches greater than a start date', async () => {
    // choose a date before a known match
    const dateStartIsAfter = moment.utc(matches[0].date_start).subtract(1, 'd');

    const source = gql`
      query SelectMatches($date_start_gte: DateTime!) {
        matches(date_start_gte: $date_start_gte) {
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
    // should find some matches
    expect(output.data?.matches.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.matches, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return dateStartAsMoment.isAfter(dateStartIsAfter);
      }),
    ).toBe(true);
  });

  it('should return matches greater than a end date', async () => {
    // choose a date before a known match
    const dateEndIsAfter = moment.utc(matches[0].date_end).subtract(1, 'd');

    const source = gql`
      query SelectMatches($date_end_gte: DateTime!) {
        matches(date_end_gte: $date_end_gte) {
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
    // should find some matches
    expect(output.data?.matches.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.matches, (e) => {
        const dateStartAsMoment = moment(e.date_end);
        return dateStartAsMoment.isAfter(dateEndIsAfter);
      }),
    ).toBe(true);
  });

  it('should return matches less than a start date', async () => {
    // choose a date after a known match
    const dateStartIsBefore = moment.utc(matches[0].date_start).add(1, 'd');

    const source = gql`
      query SelectMatches($date_start_lte: DateTime!) {
        matches(date_start_lte: $date_start_lte) {
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
    // should find some matches
    expect(output.data?.matches.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.matches, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return dateStartAsMoment.isBefore(dateStartIsBefore);
      }),
    ).toBe(true);
  });

  it('should return matches less than a end date', async () => {
    // choose a date after a known match
    const dateEndIsBefore = moment.utc(matches[0].date_end).add(1, 'd');

    const source = gql`
      query SelectMatches($date_end_lte: DateTime!) {
        matches(date_end_lte: $date_end_lte) {
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
    // should find some matches
    expect(output.data?.matches.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.matches, (e) => {
        const dateStartAsMoment = moment(e.date_end);
        return dateStartAsMoment.isBefore(dateEndIsBefore);
      }),
    ).toBe(true);
  });

  it('should return empty array if no matches found greater than a start date', async () => {
    // choose a date in far in the future, the year 3000 is a good bet ;)
    const dateStartIsAfter = moment.utc('3000-01-01');

    const source = gql`
      query SelectMatches($date_start_gte: DateTime!) {
        matches(date_start_gte: $date_start_gte) {
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
    // should find some matches
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return empty array if no matches found greater than a end date', async () => {
    // choose a date in far in the future, the year 3000 is a good bet ;)
    const dateEndIsAfter = moment.utc('3000-01-01');

    const source = gql`
      query SelectMatches($date_end_gte: DateTime!) {
        matches(date_end_gte: $date_end_gte) {
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
    // should find some matches
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return empty array if no matches found less than a start date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateStartIsBefore = moment.utc('2000-01-01');

    const source = gql`
      query SelectMatches($date_start_lte: DateTime!) {
        matches(date_start_lte: $date_start_lte) {
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
    // should find some matches
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should return empty array if no matches found less than a end date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateEndIsBefore = moment.utc('2000-01-01');

    const source = gql`
      query SelectMatches($date_end_lte: DateTime!) {
        matches(date_end_lte: $date_end_lte) {
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
    // should find some matches
    expect(output.data?.matches).toHaveLength(0);
  });

  it('should populate match elo for player 1', async () => {
    const [matchElo] = await MatchEloModel.create([
      generateMatchElo(
        matches[0].id,
        (matches[0].player1?.[0] as unknown) as ObjectId,
      ),
    ]);

    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player1_ids
          match_elo_player1 {
            _id
            before
            after
            player_id
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match._id).toBe(matches[0].id);
    expect(output.data?.match.match_elo_player1).toBeDefined();
    expect(output.data?.match.match_elo_player1._id).toBe(matchElo.id);
    expect(output.data?.match.match_elo_player1.before).toBe(matchElo.before);
    expect(output.data?.match.match_elo_player1.after).toBe(matchElo.after);
    expect(output.data?.match.match_elo_player1.player_id).toBe(
      matches[0].player1?.[0]?.toString(),
    );
  });

  it('should populate match elo for player 2', async () => {
    const [matchElo] = await MatchEloModel.create([
      generateMatchElo(
        matches[0].id,
        (matches[0].player2?.[0] as unknown) as ObjectId,
      ),
    ]);

    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player2_ids
          match_elo_player2 {
            _id
            before
            after
            player_id
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match._id).toBe(matches[0].id);
    expect(output.data?.match.match_elo_player2).toBeDefined();
    expect(output.data?.match.match_elo_player2._id).toBe(matchElo.id);
    expect(output.data?.match.match_elo_player2.before).toBe(matchElo.before);
    expect(output.data?.match.match_elo_player2.after).toBe(matchElo.after);
    expect(output.data?.match.match_elo_player2.player_id).toBe(
      matches[0].player2?.[0]?.toString(),
    );
  });

  it('should return null for match elo player 1 if not found', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player1_ids
          match_elo_player1 {
            _id
            before
            after
            player_id
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match._id).toBe(matches[0].id);
    expect(output.data?.match.match_elo_player1).toBeNull();
  });

  it('should return null for match elo player 2 if not found', async () => {
    const source = gql`
      query QueryMatches($id: ObjectId!) {
        match(id: $id) {
          _id
          player2_ids
          match_elo_player2 {
            _id
            before
            after
            player_id
          }
        }
      }
    `;

    const variableValues = {
      id: matches[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match).toBeDefined();
    expect(output.data?.match._id).toBe(matches[0].id);
    expect(output.data?.match.match_elo_player2).toBeNull();
  });
});
