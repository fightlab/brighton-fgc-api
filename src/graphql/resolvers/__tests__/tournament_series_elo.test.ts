import { DocumentType } from '@typegoose/typegoose';
import {
  TournamentSeries,
  TournamentSeriesModel,
} from '@models/tournament_series';
import { Player, PlayerModel } from '@models/player';
import {
  TournamentSeriesElo,
  TournamentSeriesEloModel,
} from '@models/tournament_series_elo';
import {
  generateTournamentSeries,
  generatePlayer,
  generateTournamentSeriesElo,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual, mean } from 'lodash';

describe('Tournament Series Elo GraphQl Resolver Test', () => {
  let tournamentSeries: Array<DocumentType<TournamentSeries>>;
  let players: Array<DocumentType<Player>>;
  let tournamentSeriesElos: Array<DocumentType<TournamentSeriesElo>>;

  beforeEach(async () => {
    tournamentSeries = await TournamentSeriesModel.create(
      Array.from(
        {
          length: 3,
        },
        () => generateTournamentSeries([new ObjectId()], true),
      ),
    );

    players = await PlayerModel.create(
      Array.from(
        {
          length: 4,
        },
        () => generatePlayer(),
      ),
    );

    tournamentSeriesElos = await TournamentSeriesEloModel.create(
      tournamentSeries.flatMap((ts) =>
        players.map((p) => generateTournamentSeriesElo(ts._id, p._id)),
      ),
    );
  });

  it('should return all tournament series elos with fields', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elos {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.length,
    );

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.tournament_series_elos,
        (e) =>
          some(tournamentSeriesElos, (s) => s.id === e._id) &&
          some(tournamentSeriesElos, (s) => s.score === e.score) &&
          some(
            tournamentSeriesElos,
            (s) => s.tournament_series?.toString() === e.tournament_series_id,
          ) &&
          some(
            tournamentSeriesElos,
            (s) => s.player?.toString() === e.player_id,
          ),
      ),
    ).toBe(true);
  });

  it('selects single tournament_series elo for a given tournament_series and player', async () => {
    const source = gql`
      query TournamentSeriesElos(
        $tournament_series: ObjectId!
        $player: ObjectId!
      ) {
        tournament_series_elo(
          player: $player
          tournament_series: $tournament_series
        ) {
          _id
          score
          tournament_series_id
          player_id
        }
      }
    `;

    const variableValues = {
      tournament_series: tournamentSeriesElos[0].tournament_series?.toString(),
      player: tournamentSeriesElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo._id).toBe(
      tournamentSeriesElos[0].id,
    );
    expect(output.data?.tournament_series_elo.score).toBe(
      tournamentSeriesElos[0].score,
    );
    expect(output.data?.tournament_series_elo.tournament_series_id).toBe(
      tournamentSeriesElos[0].tournament_series?.toString(),
    );
    expect(output.data?.tournament_series_elo.player_id).toBe(
      tournamentSeriesElos[0].player?.toString(),
    );
  });

  it('return tournament_series_elo by id', async () => {
    const source = gql`
      query TournamentSeriesElos($id: ObjectId!) {
        tournament_series_elo(id: $id) {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const variableValues = {
      id: tournamentSeriesElos[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo).toBeDefined();
    expect(output.data?.tournament_series_elo._id).toBe(
      tournamentSeriesElos[0].id,
    );
    expect(output.data?.tournament_series_elo.tournament_series_id).toBe(
      tournamentSeriesElos[0].tournament_series?.toString(),
    );
    expect(output.data?.tournament_series_elo.player_id).toBe(
      tournamentSeriesElos[0].player?.toString(),
    );
    expect(output.data?.tournament_series_elo.score).toBe(
      tournamentSeriesElos[0].score,
    );
  });

  it('returns null if no parameters provided', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elo {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo).toBeNull();
  });

  it('returns null if id not valid', async () => {
    const source = gql`
      query TournamentSeriesElos($id: ObjectId!) {
        tournament_series_elo(id: $id) {
          _id
          tournament_series_id
          player_id
          score
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
    expect(output.data?.tournament_series_elo).toBeNull();
  });

  it('returns null if tournament series not valid', async () => {
    const source = gql`
      query TournamentSeriesElos(
        $tournament_series: ObjectId!
        $player: ObjectId!
      ) {
        tournament_series_elo(
          player: $player
          tournament_series: $tournament_series
        ) {
          _id
          score
          tournament_series_id
          player_id
        }
      }
    `;

    const variableValues = {
      tournament_series: new ObjectId(),
      player: tournamentSeriesElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo).toBeNull();
  });

  it('returns null if player id not valid', async () => {
    const source = gql`
      query TournamentSeriesElos(
        $tournament_series: ObjectId!
        $player: ObjectId!
      ) {
        tournament_series_elo(
          player: $player
          tournament_series: $tournament_series
        ) {
          _id
          score
          tournament_series_id
          player_id
        }
      }
    `;

    const variableValues = {
      tournament_series: tournamentSeriesElos[0].tournament_series?.toString(),
      player: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo).toBeNull();
  });

  it('returns null if player not included', async () => {
    const source = gql`
      query TournamentSeriesElos($tournament_series: ObjectId!) {
        tournament_series_elo(tournament_series: $tournament_series) {
          _id
          score
          tournament_series_id
          player_id
        }
      }
    `;

    const variableValues = {
      tournament_series: tournamentSeriesElos[0].tournament_series?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo).toBeNull();
  });

  it('returns null if tournament series not included', async () => {
    const source = gql`
      query TournamentSeriesElos($player: ObjectId!) {
        tournament_series_elo(player: $player) {
          _id
          score
          tournament_series_id
          player_id
        }
      }
    `;

    const variableValues = {
      player: tournamentSeriesElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo).toBeNull();
  });

  it('should populate tournament series and player for a give tournament series elo', async () => {
    const source = gql`
      query TournamentSeriesElos(
        $tournament_series: ObjectId!
        $player: ObjectId!
      ) {
        tournament_series_elo(
          player: $player
          tournament_series: $tournament_series
        ) {
          _id
          tournament_series {
            _id
            name
          }
          player {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      tournament_series: tournamentSeriesElos[0].tournament_series?.toString(),
      player: tournamentSeriesElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elo._id).toBe(
      tournamentSeriesElos[0].id,
    );
    expect(output.data?.tournament_series_elo.tournament_series).toBeDefined();
    expect(output.data?.tournament_series_elo.player).toBeDefined();
    expect(output.data?.tournament_series_elo.tournament_series._id).toBe(
      tournamentSeriesElos[0].tournament_series?.toString(),
    );
    expect(output.data?.tournament_series_elo.tournament_series.name).toBe(
      tournamentSeries[0].name,
    );
    expect(output.data?.tournament_series_elo.player._id).toBe(
      tournamentSeriesElos[0].player?.toString(),
    );
    expect(output.data?.tournament_series_elo.player.handle).toBe(
      players[0].handle,
    );
  });

  // sort

  it('should sort results by torunament series id', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elos(sort: TOURNAMENT_SERIES_ID) {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const expected = orderBy(
      tournamentSeriesElos.map((r) => r.tournament_series?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series_elos;
    const received: Array<string> = dataFromQuery.map(
      (d) => d.tournament_series_id,
    );

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by player id', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elos(sort: PLAYER_ID) {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const expected = orderBy(
      tournamentSeriesElos.map((r) => r.player?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.player_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by id', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elos(sort: ID) {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const expected = orderBy(
      tournamentSeriesElos.map((r) => r.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series_elos;
    const received: Array<string> = dataFromQuery.map((d) => d._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by score asc', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elos(sort: SCORE_ASC) {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const expected = orderBy(
      tournamentSeriesElos.map((r) => r.score),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.score);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort results by score desc', async () => {
    const source = gql`
      query TournamentSeriesElos {
        tournament_series_elos(sort: SCORE_DESC) {
          _id
          tournament_series_id
          player_id
          score
        }
      }
    `;

    const expected = orderBy(
      tournamentSeriesElos.map((r) => r.score),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.score);

    expect(isEqual(received, expected)).toBe(true);
  });

  // search
  it('should return tournament series elos by list of ids', async () => {
    const source = gql`
      query TournamentSeriesElos($ids: [ObjectId!]) {
        tournament_series_elos(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [tournamentSeriesElos[0].id, tournamentSeriesElos[1].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(2);
    expect(
      every(
        output.data?.tournament_series_elos,
        (e) =>
          e._id === tournamentSeriesElos[0].id ||
          e._id === tournamentSeriesElos[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array of elos if not found by list of ids', async () => {
    const source = gql`
      query TournamentSeriesElos($ids: [ObjectId!]) {
        tournament_series_elos(ids: $ids) {
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
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(0);
  });

  it('should return tournament series elos by list of tournament series ids', async () => {
    const source = gql`
      query TournamentSeriesElos($tournament_series: [ObjectId!]) {
        tournament_series_elos(tournament_series: $tournament_series) {
          _id
          tournament_series_id
        }
      }
    `;

    const variableValues = {
      tournament_series: [tournamentSeries[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.filter(
        (ts) => ts.tournament_series?.toString() === tournamentSeries[0].id,
      ).length,
    );
    expect(
      every(
        output.data?.tournament_series_elos,
        (e) => e.tournament_series_id === tournamentSeries[0].id,
      ),
    ).toBe(true);
  });

  it('should return empty array of elos if not found by list of tournament series ids', async () => {
    const source = gql`
      query TournamentSeriesElos($tournament_series: [ObjectId!]) {
        tournament_series_elos(tournament_series: $tournament_series) {
          _id
          tournament_series_id
        }
      }
    `;

    const variableValues = {
      tournament_series: [new ObjectId(), new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(0);
  });

  it('should return tournament series elos by list of player ids', async () => {
    const source = gql`
      query TournamentSeriesElos($players: [ObjectId!]) {
        tournament_series_elos(players: $players) {
          _id
          player_id
        }
      }
    `;

    const variableValues = {
      players: [players[0].id, players[1].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.filter(
        (ts) =>
          ts.player?.toString() === players[0].id ||
          ts.player?.toString() === players[1].id,
      ).length,
    );
    expect(
      every(
        output.data?.tournament_series_elos,
        (e) => e.player_id === players[0].id || e.player_id === players[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if not found for a list of players', async () => {
    const source = gql`
      query TournamentSeriesElos($players: [ObjectId!]) {
        tournament_series_elos(players: $players) {
          _id
          player_id
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
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(0);
  });

  it('should return elos between 2 scores', async () => {
    const source = gql`
      query TournamentSeriesElos($score_gte: Float!, $score_lte: Float!) {
        tournament_series_elos(score_gte: $score_gte, score_lte: $score_lte) {
          _id
          score
        }
      }
    `;

    const meanScore = mean(tournamentSeriesElos.map((tse) => tse.score));
    const score_gte = meanScore - 250;
    const score_lte = meanScore + 250;

    const variableValues = {
      score_gte,
      score_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.filter(
        (tse) => tse.score >= score_gte && tse.score <= score_lte,
      ).length,
    );
  });

  it('should return empty array if elos not found between 2 scores', async () => {
    const source = gql`
      query TournamentSeriesElos($score_gte: Float!, $score_lte: Float!) {
        tournament_series_elos(score_gte: $score_gte, score_lte: $score_lte) {
          _id
          score
        }
      }
    `;

    const score_gte = 2000;
    const score_lte = 2001;

    const variableValues = {
      score_gte,
      score_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(0);
  });

  it('should return elos greater than or equal to a score', async () => {
    const source = gql`
      query TournamentSeriesElos($score_gte: Float!) {
        tournament_series_elos(score_gte: $score_gte) {
          _id
          score
        }
      }
    `;

    const meanScore = mean(tournamentSeriesElos.map((tse) => tse.score));
    const score_gte = meanScore;

    const variableValues = {
      score_gte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.filter((tse) => tse.score >= score_gte).length,
    );
  });

  it('should return elos less than or equal to a score', async () => {
    const source = gql`
      query TournamentSeriesElos($score_lte: Float!) {
        tournament_series_elos(score_lte: $score_lte) {
          _id
          score
        }
      }
    `;

    const meanScore = mean(tournamentSeriesElos.map((tse) => tse.score));
    const score_lte = meanScore;

    const variableValues = {
      score_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(
      tournamentSeriesElos.filter((tse) => tse.score <= score_lte).length,
    );
  });

  it('should return empty array if not found greater than given score', async () => {
    const source = gql`
      query TournamentSeriesElos($score_gte: Float!) {
        tournament_series_elos(score_gte: $score_gte) {
          _id
          score
        }
      }
    `;

    const score_gte = 1500;

    const variableValues = {
      score_gte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(0);
  });

  it('should return empty array if elos not found less than or equal to a score', async () => {
    const source = gql`
      query TournamentSeriesElos($score_lte: Float!) {
        tournament_series_elos(score_lte: $score_lte) {
          _id
          score
        }
      }
    `;

    const score_lte = 700;

    const variableValues = {
      score_lte,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_elos).toBeDefined();
    expect(output.data?.tournament_series_elos).toHaveLength(0);
  });
});
