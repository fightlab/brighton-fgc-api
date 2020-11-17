import { DocumentType } from '@typegoose/typegoose';
import { Tournament, TournamentModel } from '@models/tournament';
import { Game, GameModel } from '@models/game';
import {
  TournamentSeries,
  TournamentSeriesModel,
} from '@models/tournament_series';
import {
  generateGame,
  generateTournament,
  generateTournamentSeries,
  generateTournamentSeriesElo,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';
import {
  TournamentSeriesElo,
  TournamentSeriesEloModel,
} from '@models/tournament_series_elo';
import { CreateQuery } from 'mongoose';

describe('Tournament Series GraphQL Resolver Test', () => {
  let game: DocumentType<Game>;
  let tournaments: Array<DocumentType<Tournament>>;
  let tournamentSeries: Array<DocumentType<TournamentSeries>>;

  beforeEach(async () => {
    [game] = await GameModel.create([generateGame()]);

    tournaments = await TournamentModel.create([
      generateTournament(new ObjectId(), [game._id], [new ObjectId()], false),
      generateTournament(new ObjectId(), [game._id], [new ObjectId()], false),
      generateTournament(new ObjectId(), [], [new ObjectId()], false),
      generateTournament(new ObjectId(), [], [new ObjectId()], false),
    ] as CreateQuery<Tournament>[]);

    tournamentSeries = await TournamentSeriesModel.create([
      generateTournamentSeries(
        tournaments
          .filter((t) => !!t.games.find((g) => g?.toString() === game.id))
          .map((t) => t._id),
        false,
        game._id,
      ),
      generateTournamentSeries(
        tournaments
          .filter((t) => !t.games.find((g) => g?.toString() === game.id))
          .map((t) => t._id),
        true,
      ),
    ] as CreateQuery<TournamentSeries>[]);
  });

  it('should return all tournament series', async () => {
    const source = gql`
      query TournamentSeries {
        tournament_series {
          _id
          name
          info
          game_id
          tournament_ids
        }
      }
    `;

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(
      tournamentSeries.length,
    );
    expect(
      every(
        output.data?.tournament_series,
        (e) =>
          some(tournamentSeries, (s) => s.id === e._id) &&
          some(tournamentSeries, (s) => s.name === e.name) &&
          some(tournamentSeries, (s) => (s.info ?? null) === e.info) &&
          some(
            tournamentSeries,
            (s) => (s.game?.toString() ?? null) === e.game_id,
          ) &&
          e.tournament_ids.length > 0,
      ),
    ).toBe(true);
  });

  it('should return tournament series by id', async () => {
    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          name
          info
          game_id
          tournament_ids
        }
      }
    `;

    const variableValues = {
      id: tournamentSeries[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_single).toBeDefined();
    expect(output.data?.tournament_series_single._id).toBe(
      tournamentSeries[0].id,
    );
    expect(output.data?.tournament_series_single.name).toBe(
      tournamentSeries[0].name,
    );
    expect(output.data?.tournament_series_single.info).toBe(
      tournamentSeries[0].info,
    );
    expect(output.data?.tournament_series_single.game_id).toBe(
      tournamentSeries[0].game?.toString(),
    );
    expect(output.data?.tournament_series_single.game_id).toBe(game.id);
    expect(output.data?.tournament_series_single.tournament_ids).toEqual(
      tournamentSeries[0].tournaments.map((t) => t?.toString()),
    );
    expect(output.data?.tournament_series_single.tournament_ids).toEqual(
      tournaments
        .filter((t) => t.games[0]?.toString() === game.id)
        .map((t) => t.id),
    );
  });

  it('should return null if tournament series by id not found', async () => {
    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          name
          info
          game_id
          tournament_ids
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
    expect(output.data?.tournament_series_single).toBeNull();
  });

  // populate

  it('should populate game for a given tournament if it exists', async () => {
    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          game_id
          game {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournamentSeries[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_single).toBeDefined();
    expect(output.data?.tournament_series_single._id).toBe(
      tournamentSeries[0].id,
    );
    expect(output.data?.tournament_series_single.game_id).toBe(
      tournamentSeries[0].game?.toString(),
    );
    expect(output.data?.tournament_series_single.game._id).toBe(
      tournamentSeries[0].game?.toString(),
    );
    expect(output.data?.tournament_series_single.game._id).toBe(game.id);
    expect(output.data?.tournament_series_single.game.name).toBe(game.name);
  });

  it('populate game returns null for game if game does not exist on a tournament series', async () => {
    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          game_id
          game {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournamentSeries[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_single).toBeDefined();
    expect(output.data?.tournament_series_single._id).toBe(
      tournamentSeries[1].id,
    );
    expect(output.data?.tournament_series_single.game_id).toBeNull();
    expect(output.data?.tournament_series_single.game).toBeNull();
  });

  it('should populate tournaments for a tournament series', async () => {
    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          tournament_ids
          tournaments {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: tournamentSeries[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_single).toBeDefined();
    expect(output.data?.tournament_series_single._id).toBe(
      tournamentSeries[0].id,
    );
    expect(output.data?.tournament_series_single.tournament_ids).toEqual(
      tournamentSeries[0].tournaments.map((t) => t?.toString()),
    );
    expect(output.data?.tournament_series_single.tournament_ids).toEqual(
      tournaments
        .filter((t) => t.games[0]?.toString() === game.id)
        .map((t) => t.id),
    );
    expect(
      every(
        output.data?.tournament_series_single.tournaments,
        (e) =>
          some(tournaments, (s) => s.id === e._id) &&
          some(tournaments, (s) => s.name === e.name),
      ),
    ).toBe(true);
  });

  // sort
  it('should sort tournament series by name asc', async () => {
    const source = gql`
      query SelectTournamentSeries {
        tournament_series(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      tournamentSeries.map((e) => e.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(
      tournamentSeries.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series;
    const received: Array<string> = dataFromQuery.map((p) => p.name);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournament series by name desc', async () => {
    const source = gql`
      query SelectTournamentSeries {
        tournament_series(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      tournamentSeries.map((e) => e.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(
      tournamentSeries.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series;
    const received: Array<string> = dataFromQuery.map((p) => p.name);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort tournament series by id', async () => {
    const source = gql`
      query SelectTournamentSeries {
        tournament_series(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      tournamentSeries.map((e) => e.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(
      tournamentSeries.length,
    );

    const dataFromQuery: Array<any> = output.data?.tournament_series;
    const received: Array<string> = dataFromQuery.map((p) => p._id);
    expect(isEqual(received, expected)).toBe(true);
  });

  // search
  it('should get tournament series by list of ids', async () => {
    const source = gql`
      query SelectTournamentSeries($ids: [ObjectId!]) {
        tournament_series(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [tournamentSeries[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(1);
  });

  it('should return empty array of tournament series if not found by list of ids', async () => {
    const source = gql`
      query SelectTournamentSeries($ids: [ObjectId!]) {
        tournament_series(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(0);
  });

  it('should return list of tournament series by list of tournament ids', async () => {
    const source = gql`
      query SelectTournamentSeries($tournaments: [ObjectId!]) {
        tournament_series(tournaments: $tournaments) {
          _id
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
    expect(output.data?.tournament_series).toHaveLength(1);
  });

  it('return empty array if not found by list of tournament ids', async () => {
    const source = gql`
      query SelectTournamentSeries($tournaments: [ObjectId!]) {
        tournament_series(tournaments: $tournaments) {
          _id
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
    expect(output.data?.tournament_series).toHaveLength(0);
  });

  it('should return list of tournament series by list of game ids', async () => {
    const source = gql`
      query SelectTournamentSeries($games: [ObjectId!]) {
        tournament_series(games: $games) {
          _id
        }
      }
    `;

    const variableValues = {
      games: [game.id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(1);
  });

  it('return empty array if not found by list of game ids', async () => {
    const source = gql`
      query SelectTournamentSeries($games: [ObjectId!]) {
        tournament_series(games: $games) {
          _id
        }
      }
    `;

    const variableValues = {
      games: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(0);
  });

  it('should return list of tournament series by search for name', async () => {
    const source = gql`
      query SelectTournamentSeries($search: String) {
        tournament_series(search: $search) {
          _id
        }
      }
    `;

    const variableValues = {
      search: tournamentSeries[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(1);
  });

  it('should return empty array if not found by search', async () => {
    const source = gql`
      query SelectTournamentSeries($search: String) {
        tournament_series(search: $search) {
          _id
        }
      }
    `;

    const variableValues = {
      search: `jiofahfoi8qyhf9 803y1809rfyh8o0ifyhih iuhfi`,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series).toHaveLength(0);
  });

  it('should populate tournament series elo for a given tournament series', async () => {
    const tournament_series_elos = await TournamentSeriesEloModel.create([
      generateTournamentSeriesElo(tournamentSeries[0]._id, new ObjectId()),
      generateTournamentSeriesElo(tournamentSeries[0]._id, new ObjectId()),
    ] as CreateQuery<TournamentSeriesElo>[]);

    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          tournament_series_elos {
            _id
            tournament_series_id
            score
          }
        }
      }
    `;

    const variableValues = {
      id: tournamentSeries[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_single).toBeDefined();
    expect(output.data?.tournament_series_single._id).toBe(
      tournamentSeries[0].id,
    );
    expect(
      output.data?.tournament_series_single.tournament_series_elos,
    ).toHaveLength(tournament_series_elos.length);
    expect(
      every(
        output.data?.tournament_series_single.tournament_series_elos,
        (e) =>
          (e._id === tournament_series_elos[0].id ||
            e._id === tournament_series_elos[1].id) &&
          (e.score === tournament_series_elos[0].score ||
            e.score === tournament_series_elos[1].score),
      ),
    ).toBe(true);
  });

  it('should return empty array if tournament series elos not found for a given torunament series', async () => {
    const source = gql`
      query TournamentSeries($id: ObjectId!) {
        tournament_series_single(id: $id) {
          _id
          tournament_series_elos {
            _id
            tournament_series_id
            score
          }
        }
      }
    `;

    const variableValues = {
      id: tournamentSeries[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament_series_single).toBeDefined();
    expect(output.data?.tournament_series_single._id).toBe(
      tournamentSeries[0].id,
    );
    expect(
      output.data?.tournament_series_single.tournament_series_elos,
    ).toHaveLength(0);
  });
});
