import { DocumentType } from '@typegoose/typegoose';
import { Player, PlayerModel } from '@models/player';
import { Tournament, TournamentModel } from '@models/tournament';
import { Result, ResultModel } from '@models/result';
import {
  generatePlayer,
  generateTournament,
  generateResult,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';

describe('Result GraphQl Resolver Test', () => {
  let players: Array<DocumentType<Player>>;
  let tournaments: Array<DocumentType<Tournament>>;
  let results: Array<DocumentType<Result>>;

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
            false,
          ),
      ),
    );

    results = await ResultModel.create(
      tournaments.flatMap((t) =>
        t.players.map((p, i) => generateResult(t._id, [p as ObjectId], i)),
      ),
    );
  });

  it('return all results with fields', async () => {
    const source = gql`
      query QueryResults {
        results {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(results.length);

    expect(
      every(
        output.data?.results,
        (e) =>
          some(results, (s) => e._id === s.id) &&
          some(results, (s) => e.tournament_id === s.tournament?.toString()) &&
          some(
            results,
            (s) => e.player_ids[0] === s.players?.[0]?.toString(),
          ) &&
          some(results, (s) => e.rank === s.rank),
      ),
    ).toBe(true);
  });

  it('return result by id', async () => {
    const source = gql`
      query QueryResults($id: ObjectId!) {
        result(id: $id) {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const variableValues = {
      id: results[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeDefined();
    expect(output.data?.result._id).toBe(results[0].id);
    expect(output.data?.result.tournament_id).toBe(
      results[0].tournament?.toString(),
    );
    expect(output.data?.result.player_ids).toHaveLength(1);
    expect(output.data?.result.player_ids[0]).toBe(
      results[0].players?.[0]?.toString(),
    );
    expect(output.data?.result.rank).toBe(results[0].rank);
  });

  it('return result by player and tournament', async () => {
    const source = gql`
      query QueryResults($player: ObjectId!, $tournament: ObjectId!) {
        result(player: $player, tournament: $tournament) {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const variableValues = {
      player: players[0].id,
      tournament: tournaments[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeDefined();
    expect(output.data?.result._id).toBe(results[0].id);
    expect(output.data?.result.tournament_id).toBe(
      results[0].tournament?.toString(),
    );
    expect(output.data?.result.player_ids).toHaveLength(1);
    expect(output.data?.result.player_ids[0]).toBe(
      results[0].players?.[0]?.toString(),
    );
    expect(output.data?.result.rank).toBe(results[0].rank);
  });

  it('return null if no query variables provided', async () => {
    const source = gql`
      query QueryResults {
        result {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeNull();
  });

  it('return null if id not valid', async () => {
    const source = gql`
      query QueryResults($id: ObjectId!) {
        result(id: $id) {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const variableValues = {
      id: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeNull();
  });

  it('return null if either player or tournament not valid', async () => {
    const source = gql`
      query QueryResults($player: ObjectId!, $tournament: ObjectId!) {
        result(player: $player, tournament: $tournament) {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const variableValues = {
      player: new ObjectId(),
      tournament: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeNull();
  });

  it('return null if either player provided & tournament not provided', async () => {
    const source = gql`
      query QueryResults($player: ObjectId!) {
        result(player: $player) {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const variableValues = {
      player: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeNull();
  });

  it('return null if either player not provided & tournament provided', async () => {
    const source = gql`
      query QueryResults($tournament: ObjectId!) {
        result(tournament: $tournament) {
          _id
          tournament_id
          player_ids
          rank
        }
      }
    `;

    const variableValues = {
      tournament: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeNull();
  });

  // populate fields
  it('should populate tournament for a given result', async () => {
    const source = gql`
      query QueryResults($id: ObjectId!) {
        result(id: $id) {
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
      id: results[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeDefined();
    expect(output.data?.result._id).toBe(results[0].id);
    expect(output.data?.result.tournament_id).toBe(
      results[0].tournament?.toString(),
    );
    expect(output.data?.result.tournament).toBeDefined();
    expect(output.data?.result.tournament._id).toBe(
      results[0].tournament?.toString(),
    );
    expect(output.data?.result.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.result.tournament.name).toBe(tournaments[0].name);
  });

  it('should populate player for a given result', async () => {
    const source = gql`
      query QueryResults($id: ObjectId!) {
        result(id: $id) {
          _id
          player_ids
          players {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      id: results[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.result).toBeDefined();
    expect(output.data?.result._id).toBe(results[0].id);
    expect(output.data?.result.players).toHaveLength(1);
    expect(output.data?.result.players[0]._id).toBe(players[0].id);
    expect(output.data?.result.players[0].handle).toBe(players[0].handle);
  });

  // sort

  it('should sort results by tournament id', async () => {
    const source = gql`
      query QueryResults {
        results(sort: TOURNAMENT_ID) {
          _id
          tournament_id
        }
      }
    `;

    const expected = orderBy(
      results.map((r) => r.tournament?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toHaveLength(results.length);

    const dataFromQuery: Array<any> = output.data?.results;
    const received: Array<string> = dataFromQuery.map((d) => d.tournament_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by rank asc', async () => {
    const source = gql`
      query QueryResults {
        results(sort: RANK_ASC) {
          _id
          rank
        }
      }
    `;

    const expected = orderBy(
      results.map((r) => r.rank),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toHaveLength(results.length);

    const dataFromQuery: Array<any> = output.data?.results;
    const received: Array<string> = dataFromQuery.map((d) => d.rank);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by rank desc', async () => {
    const source = gql`
      query QueryResults {
        results(sort: RANK_DESC) {
          _id
          rank
        }
      }
    `;

    const expected = orderBy(
      results.map((r) => r.rank),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toHaveLength(results.length);

    const dataFromQuery: Array<any> = output.data?.results;
    const received: Array<string> = dataFromQuery.map((d) => d.rank);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by id', async () => {
    const source = gql`
      query QueryResults {
        results(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      results.map((r) => r.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toHaveLength(results.length);

    const dataFromQuery: Array<any> = output.data?.results;
    const received: Array<string> = dataFromQuery.map((d) => d._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  // search
  it('should return results by list of ids', async () => {
    const source = gql`
      query QueryResults($ids: [ObjectId!]) {
        results(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [results[0].id, results[1].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(2);
    expect(
      every(
        output.data?.results,
        (e) => e._id === results[0].id || e._id === results[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if results not found for a list of ids', async () => {
    const source = gql`
      query QueryResults($ids: [ObjectId!]) {
        results(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId(), new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(0);
  });

  it('should return results by list of tournament ids', async () => {
    const source = gql`
      query QueryResults($tournaments: [ObjectId!]) {
        results(tournaments: $tournaments) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournaments: [tournaments[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(
      results.filter((r) => r.tournament?.toString() === tournaments[0].id)
        .length,
    );
  });

  it('should return empty array if results not found for a list of tournament ids', async () => {
    const source = gql`
      query QueryResults($tournaments: [ObjectId!]) {
        results(tournaments: $tournaments) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournaments: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(0);
  });

  it('should return results by list of player ids', async () => {
    const source = gql`
      query QueryResults($players: [ObjectId!]) {
        results(players: $players) {
          _id
          player_ids
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
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(
      results.filter((r) => r.players[0]?.toString() === players[0].id).length,
    );
  });

  it('should return empty array if results not found for a list of player ids', async () => {
    const source = gql`
      query QueryResults($players: [ObjectId!]) {
        results(players: $players) {
          _id
          player_ids
        }
      }
    `;

    const variableValues = {
      players: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(0);
  });

  it('should return results between 2 ranks', async () => {
    const source = gql`
      query QueryResults($rank_gte: Float!, $rank_lte: Float!) {
        results(rank_gte: $rank_gte, rank_lte: $rank_lte) {
          _id
          rank
        }
      }
    `;

    const variableValues = {
      rank_gte: 1,
      rank_lte: 2,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(
      results.filter((r) => r.rank === 1 || r.rank === 2).length,
    );
  });

  it('should return empty array if results not found between 2 ranks', async () => {
    const source = gql`
      query QueryResults($rank_gte: Float!, $rank_lte: Float!) {
        results(rank_gte: $rank_gte, rank_lte: $rank_lte) {
          _id
          rank
        }
      }
    `;

    const variableValues = {
      rank_gte: 99,
      rank_lte: 100,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(0);
  });

  it('should return tournaments greater than a given rank', async () => {
    const source = gql`
      query QueryResults($rank_gte: Float!) {
        results(rank_gte: $rank_gte) {
          _id
          rank
        }
      }
    `;

    const variableValues = {
      rank_gte: 2,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(
      results.filter((r) => r.rank >= 2).length,
    );
  });

  it('should return empty array if no results found greater than a given rank', async () => {
    const source = gql`
      query QueryResults($rank_gte: Float!) {
        results(rank_gte: $rank_gte) {
          _id
          rank
        }
      }
    `;

    const variableValues = {
      rank_gte: 99,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(0);
  });

  it('should return tournaments less than a given rank', async () => {
    const source = gql`
      query QueryResults($rank_lte: Float!) {
        results(rank_lte: $rank_lte) {
          _id
          rank
        }
      }
    `;

    const variableValues = {
      rank_lte: 2,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(
      results.filter((r) => r.rank <= 2).length,
    );
  });

  it('should return empty array if no results found less than a given rank', async () => {
    const source = gql`
      query QueryResults($rank_lte: Float!) {
        results(rank_lte: $rank_lte) {
          _id
          rank
        }
      }
    `;

    const variableValues = {
      rank_lte: -1,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.results).toBeDefined();
    expect(output.data?.results).toHaveLength(0);
  });
});
