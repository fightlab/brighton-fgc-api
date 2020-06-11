import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import {
  generatePlayer,
  generateGameElo,
  generatePlayerSocial,
  generateTournament,
  generateMatch,
  generateResult,
} from '@graphql/resolvers/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some, orderBy, isEqual } from 'lodash';
import { Player, PlayerModel } from '@models/player';
import { ObjectId } from 'mongodb';
import { GameEloModel } from '@models/game_elo';
import { PlayerSocialModel } from '@models/player_social';
import { TournamentModel } from '@models/tournament';
import { MatchModel } from '@models/match';
import { ResultModel } from '@models/result';

describe('Player GraphQL Resolver Test', () => {
  let players: Array<DocumentType<Player>>;

  beforeEach(async () => {
    players = await PlayerModel.create(
      Array.from(
        {
          // generate enough players that there'll be likely at least 1 staff member
          length: 10,
        },
        () => generatePlayer(false),
      ) as Array<Player>,
    );
  });

  it('should return all players with fields', async () => {
    const source = gql`
      query SelectAllPlayers {
        players {
          _id
          handle
          team
          icon
          is_staff
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toHaveLength(players.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.players,
        (e) =>
          some(players, (s) => s.id === e._id) &&
          some(players, (s) => s.handle === e.handle) &&
          some(players, (s) => s.icon === e.icon) &&
          some(players, (s) => s.is_staff === e.is_staff) &&
          some(players, (s) => s.team === e.team),
      ),
    ).toBe(true);
  });

  it('should return a single player by id', async () => {
    const source = gql`
      query SelectSinglePlayer($id: ObjectId!) {
        player(id: $id) {
          _id
          handle
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.handle).toBe(players[0].handle);
  });

  it('should return null if player id not found', async () => {
    const source = gql`
      query SelectSinglePlayerNull($id: ObjectId!) {
        player(id: $id) {
          _id
          handle
        }
      }
    `;

    const variableValues = {
      id: '5eca9c57495caf001c2fb560',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeNull();
  });

  it('should sort players by handle asc', async () => {
    const source = gql`
      query SortPlayerHandleAsc {
        players(sort: HANDLE_ASC) {
          _id
          handle
        }
      }
    `;

    const expected = orderBy(
      players.map((b) => b.handle),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toHaveLength(players.length);

    const dataFromQuery: Array<any> = output.data?.players;
    const received: Array<string> = dataFromQuery.map((p) => p.handle);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort players by handle desc', async () => {
    const source = gql`
      query SortPlayerHandleDesc {
        players(sort: HANDLE_DESC) {
          _id
          handle
        }
      }
    `;

    const expected = orderBy(
      players.map((b) => b.handle),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toHaveLength(players.length);

    const dataFromQuery: Array<any> = output.data?.players;
    const received: Array<string> = dataFromQuery.map((p) => p.handle);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort players by is_staff', async () => {
    const source = gql`
      query SortPlayerHandleDesc {
        players(sort: IS_STAFF) {
          _id
          is_staff
        }
      }
    `;

    const expected = orderBy(
      players.map((b) => b.is_staff),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toHaveLength(players.length);

    const dataFromQuery: Array<any> = output.data?.players;
    const received: Array<string> = dataFromQuery.map((p) => p.is_staff);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort players by id', async () => {
    const source = gql`
      query SortPlayerHandleDesc {
        players(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      players.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toHaveLength(players.length);

    const dataFromQuery: Array<any> = output.data?.players;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search players by handle', async () => {
    const source = gql`
      query SearchPlayersByHandle($search: String!) {
        players(search: $search) {
          _id
          handle
        }
      }
    `;

    const variableValues = {
      // search by handle lowercase to check it works
      search: players[0].handle.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toBeDefined();
    expect(output.data?.players).toHaveLength(1);
    expect(output.data?.players[0]._id).toBe(players[0].id);
    expect(output.data?.players[0].handle).toBe(players[0].handle);
  });

  it('should return empty array if search players by handle returns no results', async () => {
    const source = gql`
      query SearchPlayersByHandle($search: String!) {
        players(search: $search) {
          _id
          handle
        }
      }
    `;

    const variableValues = {
      // use unintelligible string, highly unlikely it will be an actual handle
      search: 'qqweqewcnoiaskhfnoihoiehtiohfoigafio',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toBeDefined();
    expect(output.data?.players).toHaveLength(0);
  });

  it('should search players by list of ids', async () => {
    const source = gql`
      query PlayersByIds($ids: [ObjectId!]) {
        players(ids: $ids) {
          _id
          handle
        }
      }
    `;

    const variableValues = {
      ids: players.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toBeDefined();
    expect(output.data?.players).toHaveLength(players.length);
  });

  it('should return empty array if search players by list of ids returns no results', async () => {
    const source = gql`
      query PlayersByIds($ids: [ObjectId!]) {
        players(ids: $ids) {
          _id
          handle
        }
      }
    `;

    const variableValues = {
      // generate some fake object ids
      ids: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.players).toBeDefined();
    expect(output.data?.players).toHaveLength(0);
  });

  it('should resolve game_elos', async () => {
    // add a couple of game elos to the database
    const gameElos = await GameEloModel.create([
      generateGameElo(players[0]._id, new ObjectId()),
      generateGameElo(players[0]._id, new ObjectId()),
    ]);

    const source = gql`
      query SelectSingleGame($id: ObjectId!) {
        player(id: $id) {
          _id
          game_elos {
            _id
            score
            player_id
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.game_elos).toHaveLength(gameElos.length);
    expect(
      every(
        output.data?.player.game_elos,
        (e) =>
          some(gameElos, (s) => s.id === e._id) &&
          some(gameElos, (s) => s.score === e.score) &&
          every(gameElos, (ge) => ge.player?.toString() === e.player_id),
      ),
    ).toBe(true);
  });

  it('should resolve player social', async () => {
    const [playerSocial] = await PlayerSocialModel.create([
      generatePlayerSocial(players[0]._id, 'min'),
    ]);

    const source = gql`
      query SelectPlayerSocial($id: ObjectId!) {
        player(id: $id) {
          _id
          player_social {
            _id
            web
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data?.player).toBeDefined();
    expect(output.data?.player.player_social).toBeDefined();
    expect(output.data?.player.player_social._id).toBe(playerSocial.id);
    expect(output.data?.player.player_social.web).toBeNull();
  });

  it('should return null for player social if not found', async () => {
    const source = gql`
      query SelectPlayerSocial($id: ObjectId!) {
        player(id: $id) {
          _id
          player_social {
            _id
            web
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data?.player).toBeDefined();
    expect(output.data?.player.player_social).toBeNull();
  });

  it('should return tournaments that a player has featured in', async () => {
    const tournaments = await TournamentModel.create([
      generateTournament(
        new ObjectId(),
        [new ObjectId()],
        players.map((p) => p._id),
        true,
      ),
      generateTournament(
        new ObjectId(),
        [new ObjectId()],
        players.map((p) => p._id),
        true,
      ),
    ]);

    const source = gql`
      query QueryPlayers($id: ObjectId!) {
        player(id: $id) {
          _id
          tournaments {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.tournaments).toBeDefined();
    expect(output.data?.player.tournaments).toHaveLength(2);
    expect(
      every(
        output.data?.player.tournaments,
        (e) => !!tournaments.find((t) => t.id === e._id),
      ),
    ).toBe(true);
  });

  it('should return empty array of tournaments if player has not featured in any', async () => {
    const source = gql`
      query QueryPlayers($id: ObjectId!) {
        player(id: $id) {
          _id
          tournaments {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.tournaments).toBeDefined();
    expect(output.data?.player.tournaments).toHaveLength(0);
  });

  it('should return matches that a player has featured in', async () => {
    const matches = await MatchModel.create([
      generateMatch(new ObjectId(), [players[1]._id], [players[0]._id], false),
      generateMatch(new ObjectId(), [players[0]._id], [players[1]._id], false),
    ]);

    const source = gql`
      query QueryPlayers($id: ObjectId!) {
        player(id: $id) {
          _id
          matches {
            _id
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.matches).toBeDefined();
    expect(output.data?.player.matches).toHaveLength(2);
    expect(
      every(
        output.data?.player.matches,
        (e) => !!matches.find((t) => t.id === e._id),
      ),
    ).toBe(true);
  });

  it('should return empty array of matches if a player has no matches featured in', async () => {
    const source = gql`
      query QueryPlayers($id: ObjectId!) {
        player(id: $id) {
          _id
          matches {
            _id
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.matches).toBeDefined();
    expect(output.data?.player.matches).toHaveLength(0);
  });

  it('should populate results for a given player', async () => {
    const results = await ResultModel.create([
      generateResult(new ObjectId(), [players[0]._id], 1),
      generateResult(new ObjectId(), [players[0]._id], 2),
    ]);

    const source = gql`
      query QueryPlayers($id: ObjectId!) {
        player(id: $id) {
          _id
          results {
            _id
            rank
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.results).toHaveLength(results.length);
    expect(
      every(
        output.data?.player.results,
        (e) => e._id === results[0].id || e._id === results[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if no results found for a given player', async () => {
    const source = gql`
      query QueryPlayers($id: ObjectId!) {
        player(id: $id) {
          _id
          results {
            _id
            rank
          }
        }
      }
    `;

    const variableValues = {
      id: players[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.player).toBeDefined();
    expect(output.data?.player._id).toBe(players[0].id);
    expect(output.data?.player.results).toHaveLength(0);
  });
});
