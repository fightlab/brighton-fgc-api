import { DocumentType } from '@typegoose/typegoose';
import { Match, MatchModel } from '@models/match';
import { Player, PlayerModel } from '@models/player';
import {
  generatePlayer,
  generateMatch,
  generateMatchElo,
} from '@graphql/resolvers/test/generate';
import { sample, every, some, orderBy, isEqual, mean } from 'lodash';
import { ObjectId } from 'mongodb';
import { MatchElo, MatchEloModel } from '@models/match_elo';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';

describe('Match Elo GraphQL Resolver Test', () => {
  let players: Array<DocumentType<Player>>;
  let matches: Array<DocumentType<Match>>;
  let matchElos: Array<DocumentType<MatchElo>>;

  beforeEach(async () => {
    players = await PlayerModel.create(
      Array.from(
        {
          length: 4,
        },
        () => generatePlayer(true),
      ),
    );

    matches = await MatchModel.create(
      players.map((player) =>
        generateMatch(
          new ObjectId(),
          [player._id],
          [sample(players)?._id],
          false,
        ),
      ),
    );

    matchElos = await MatchEloModel.create(
      matches.flatMap((match) => [
        match.player1 &&
          generateMatchElo(match._id, match.player1[0] as ObjectId),
        match.player2 &&
          generateMatchElo(match._id, match.player2[0] as ObjectId),
      ]),
    );
  });

  it('should return all match elos with fields', async () => {
    const source = gql`
      query QueryMatchElos {
        match_elos {
          _id
          after
          before
          match_id
          player_id
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(matchElos.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.match_elos,
        (e) =>
          some(matchElos, (s) => s.id === e._id) &&
          some(matchElos, (s) => s.before === e.before) &&
          some(matchElos, (s) => s.after === e.after) &&
          some(matchElos, (s) => s.match?.toString() === e.match_id) &&
          some(matchElos, (s) => s.player?.toString() === e.player_id),
      ),
    ).toBe(true);
  });

  it('should return single match elo for a given id with all fields', async () => {
    const source = gql`
      query QueryMatchElos($id: ObjectId!) {
        match_elo(id: $id) {
          _id
          after
          before
          match_id
          player_id
        }
      }
    `;

    const variableValues = {
      id: matchElos[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.match_elo).toBeDefined();
    expect(output.data?.match_elo._id).toBe(matchElos[0].id);
    expect(output.data?.match_elo.before).toBe(matchElos[0].before);
    expect(output.data?.match_elo.after).toBe(matchElos[0].after);
    expect(output.data?.match_elo.match_id).toBe(
      matchElos[0].match?.toString(),
    );
    expect(output.data?.match_elo.match_id).toBe(matches[0].id);
    expect(output.data?.match_elo.player_id).toBe(
      matchElos[0].player?.toString(),
    );
    expect(output.data?.match_elo.player_id).toBe(players[0].id);
  });

  it('should return null if match elo not found for a given match elo id', async () => {
    const source = gql`
      query QueryMatchElos($id: ObjectId!) {
        match_elo(id: $id) {
          _id
          after
          before
          match_id
          player_id
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
    expect(output.data?.match_elo).toBeNull();
  });

  it('should return single match elo for a given match and player with all fields', async () => {
    const source = gql`
      query QueryMatchElos($match: ObjectId!, $player: ObjectId!) {
        match_elo(match: $match, player: $player) {
          _id
          after
          before
          match_id
          player_id
        }
      }
    `;

    const variableValues = {
      match: matches[0]._id,
      player: players[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.match_elo).toBeDefined();
    expect(output.data?.match_elo._id).toBe(matchElos[0].id);
    expect(output.data?.match_elo.before).toBe(matchElos[0].before);
    expect(output.data?.match_elo.after).toBe(matchElos[0].after);
    expect(output.data?.match_elo.match_id).toBe(
      matchElos[0].match?.toString(),
    );
    expect(output.data?.match_elo.match_id).toBe(matches[0].id);
    expect(output.data?.match_elo.player_id).toBe(
      matchElos[0].player?.toString(),
    );
    expect(output.data?.match_elo.player_id).toBe(players[0].id);
  });

  it('should return null if match elo not found for a given match', async () => {
    const source = gql`
      query QueryMatchElos($match: ObjectId!, $player: ObjectId!) {
        match_elo(match: $match, player: $player) {
          _id
          after
          before
          match_id
          player_id
        }
      }
    `;

    const variableValues = {
      match: new ObjectId(),
      player: players[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.match_elo).toBeNull();
  });

  it('should return null if match elo not found for a given player', async () => {
    const source = gql`
      query QueryMatchElos($match: ObjectId!, $player: ObjectId!) {
        match_elo(match: $match, player: $player) {
          _id
          after
          before
          match_id
          player_id
        }
      }
    `;

    const variableValues = {
      match: matches[0]._id,
      player: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.match_elo).toBeNull();
  });

  it('should populate match and player for a given match elo', async () => {
    const source = gql`
      query QueryMatchElos($match: ObjectId!, $player: ObjectId!) {
        match_elo(match: $match, player: $player) {
          _id
          match {
            _id
            tournament_id
          }
          player {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      match: matches[0]._id,
      player: players[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    expect(output.data).toBeDefined();
    expect(output.data?.match_elo).toBeDefined();
    expect(output.data?.match_elo._id).toBe(matchElos[0].id);
    expect(output.data?.match_elo.match._id).toBe(
      matchElos[0].match?.toString(),
    );
    expect(output.data?.match_elo.match._id).toBe(matches[0].id);
    expect(output.data?.match_elo.match.tournament_id).toBe(
      matches[0].tournament?.toString(),
    );
    expect(output.data?.match_elo.player._id).toBe(
      matchElos[0].player?.toString(),
    );
    expect(output.data?.match_elo.player._id).toBe(players[0].id);
    expect(output.data?.match_elo.player.handle).toBe(players[0].handle);
  });

  // searches

  it('should return match elos for a given list of match ids', async () => {
    const source = gql`
      query QueryMatchElos($matches: [ObjectId!]) {
        match_elos(matches: $matches) {
          _id
          match_id
        }
      }
    `;

    const variableValues = {
      matches: [matches[0]._id, matches[1]._id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(4);
    expect(
      every(
        output.data?.match_elos,
        (e) => e.match_id === matches[0].id || e.match_id === matches[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if not found for list of match ids', async () => {
    const source = gql`
      query QueryMatchElos($matches: [ObjectId!]) {
        match_elos(matches: $matches) {
          _id
          match_id
        }
      }
    `;

    const variableValues = {
      matches: [new ObjectId(), new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  it('should return match elos for a given list of player ids', async () => {
    const source = gql`
      query QueryMatchElos($players: [ObjectId!]) {
        match_elos(players: $players) {
          _id
          player_id
        }
      }
    `;

    const variableValues = {
      players: [players[0]._id, players[1]._id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(
      matchElos.filter(
        (me) =>
          me.player?.toString() === players[0].id ||
          me.player?.toString() === players[1].id,
      ).length,
    );
    expect(
      every(
        output.data?.match_elos,
        (e) => e.player_id === players[0].id || e.player_id === players[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if not found for list of player ids', async () => {
    const source = gql`
      query QueryMatchElos($players: [ObjectId!]) {
        match_elos(players: $players) {
          _id
          match_id
        }
      }
    `;

    const variableValues = {
      players: [new ObjectId(), new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  // sorting

  it('should sort match elos by match id', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: MATCH_ID) {
          _id
          match_id
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.match?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.match_id);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort match elos by player id', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: PLAYER_ID) {
          _id
          player_id
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.player?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.player_id);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort match elos by before before asc', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: BEFORE_SCORE_ASC) {
          _id
          before
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.before),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.before);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort match elos by before before desc', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: BEFORE_SCORE_DESC) {
          _id
          before
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.before),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.before);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort match elos by after before asc', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: AFTER_SCORE_ASC) {
          _id
          after
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.after),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.after);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort match elos by after before desc', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: AFTER_SCORE_DESC) {
          _id
          after
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.after),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.after);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort match elos by id', async () => {
    const source = gql`
      query MatchElos {
        match_elos(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      matchElos.map((m) => m.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.match_elos;
    const received: Array<string> = dataFromQuery.map((d) => d._id);

    expect(dataFromQuery).toHaveLength(matchElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should return empty array if elos not found between 2 before scores', async () => {
    const source = gql`
      query MatchElos($before_gte: Float!, $before_lte: Float!) {
        match_elos(before_gte: $before_gte, before_lte: $before_lte) {
          _id
          before
        }
      }
    `;

    const before_gte = 2000;
    const before_lte = 2001;

    const variableValues = {
      before_gte,
      before_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  it('should return elos greater than or equal to a before score', async () => {
    const source = gql`
      query MatchElos($before_gte: Float!) {
        match_elos(before_gte: $before_gte) {
          _id
          before
        }
      }
    `;

    const meanScore = mean(matchElos.map((me) => me.before));
    const before_gte = meanScore;

    const variableValues = {
      before_gte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(
      matchElos.filter((me) => me.before >= before_gte).length,
    );
  });

  it('should return elos less than or equal to a before score', async () => {
    const source = gql`
      query MatchElos($before_lte: Float!) {
        match_elos(before_lte: $before_lte) {
          _id
          before
        }
      }
    `;

    const meanScore = mean(matchElos.map((me) => me.before));
    const before_lte = meanScore;

    const variableValues = {
      before_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(
      matchElos.filter((me) => me.before <= before_lte).length,
    );
  });

  it('should return empty array if not found greater than given before score', async () => {
    const source = gql`
      query MatchElos($before_gte: Float!) {
        match_elos(before_gte: $before_gte) {
          _id
          before
        }
      }
    `;

    const before_gte = 1500;

    const variableValues = {
      before_gte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  it('should return empty array if elos not found less than or equal to a before score', async () => {
    const source = gql`
      query MatchElos($before_lte: Float!) {
        match_elos(before_lte: $before_lte) {
          _id
          before
        }
      }
    `;

    const before_lte = 700;

    const variableValues = {
      before_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  it('should return empty array if elos not found between 2 after scores', async () => {
    const source = gql`
      query MatchElos($after_gte: Float!, $after_lte: Float!) {
        match_elos(after_gte: $after_gte, after_lte: $after_lte) {
          _id
          after
        }
      }
    `;

    const after_gte = 2000;
    const after_lte = 2001;

    const variableValues = {
      after_gte,
      after_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  it('should return elos greater than or equal to a after score', async () => {
    const source = gql`
      query MatchElos($after_gte: Float!) {
        match_elos(after_gte: $after_gte) {
          _id
          after
        }
      }
    `;

    const meanScore = mean(matchElos.map((me) => me.after));
    const after_gte = meanScore;

    const variableValues = {
      after_gte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(
      matchElos.filter((me) => me.after >= after_gte).length,
    );
  });

  it('should return elos less than or equal to a after score', async () => {
    const source = gql`
      query MatchElos($after_lte: Float!) {
        match_elos(after_lte: $after_lte) {
          _id
          after
        }
      }
    `;

    const meanScore = mean(matchElos.map((me) => me.after));
    const after_lte = meanScore;

    const variableValues = {
      after_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(
      matchElos.filter((me) => me.after <= after_lte).length,
    );
  });

  it('should return empty array if not found greater than given after score', async () => {
    const source = gql`
      query MatchElos($after_gte: Float!) {
        match_elos(after_gte: $after_gte) {
          _id
          after
        }
      }
    `;

    const after_gte = 1500;

    const variableValues = {
      after_gte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });

  it('should return empty array if elos not found less than or equal to a after score', async () => {
    const source = gql`
      query MatchElos($after_lte: Float!) {
        match_elos(after_lte: $after_lte) {
          _id
          after
        }
      }
    `;

    const after_lte = 700;

    const variableValues = {
      after_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.match_elos).toBeDefined();
    expect(output.data?.match_elos).toHaveLength(0);
  });
});
