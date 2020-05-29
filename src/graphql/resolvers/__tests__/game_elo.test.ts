import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import {
  generateGameElo,
  generateGame,
  generatePlayer,
} from '@graphql/resolvers/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some, orderBy, isEqual } from 'lodash';
import { GameElo, GameEloModel } from '@models/game_elo';
import { Game, GameModel } from '@models/game';
import { Player, PlayerModel } from '@models/player';
import { ObjectId } from 'mongodb';

describe('Game Elo GraphQL Resolver Test', () => {
  let games: Array<DocumentType<Game>>;
  let players: Array<DocumentType<Player>>;
  let gameElos: Array<DocumentType<GameElo>>;

  beforeEach(async () => {
    games = await GameModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateGame(false),
      ),
    );

    players = await PlayerModel.create(
      Array.from(
        {
          length: 8,
        },
        () => generatePlayer(false),
      ),
    );

    // create a game elo for each player for each game
    const gameElosToGenerate: Array<GameElo> = games.flatMap((game) =>
      players.map((player) => generateGameElo(player._id, game._id)),
    );
    gameElos = await GameEloModel.create(gameElosToGenerate);
  });

  it('should return all game elos with fields', async () => {
    const source = gql`
      query SelectAllGameElos {
        game_elos {
          _id
          game_id
          player_id
          score
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elos).toHaveLength(gameElos.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.game_elos,
        (e) =>
          some(gameElos, (s) => s.id === e._id) &&
          some(gameElos, (s) => s.score === e.score) &&
          some(gameElos, (s) => s.game?.toString() === e.game_id) &&
          some(gameElos, (s) => s.player?.toString() === e.player_id),
      ),
    ).toBe(true);
  });

  it('selects single game elo for a given game and player', async () => {
    const source = gql`
      query SelectGameElo($game: ObjectId!, $player: ObjectId!) {
        game_elo(player: $player, game: $game) {
          _id
          score
          game_id
          player_id
        }
      }
    `;

    const variableValues = {
      game: gameElos[0].game?.toString(),
      player: gameElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elo._id).toBe(gameElos[0].id);
    expect(output.data?.game_elo.score).toBe(gameElos[0].score);
    expect(output.data?.game_elo.game_id).toBe(gameElos[0].game?.toString());
    expect(output.data?.game_elo.player_id).toBe(
      gameElos[0].player?.toString(),
    );
  });

  it('should return null if not found for a given game', async () => {
    const source = gql`
      query SelectGameElo($game: ObjectId!, $player: ObjectId!) {
        game_elo(player: $player, game: $game) {
          _id
          score
          game_id
          player_id
        }
      }
    `;

    const variableValues = {
      game: new ObjectId().toHexString(), // game with this id won't exist
      player: gameElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elo).toBeNull();
  });

  it('should return null if not found for a given player', async () => {
    const source = gql`
      query SelectGameElo($game: ObjectId!, $player: ObjectId!) {
        game_elo(player: $player, game: $game) {
          _id
          score
          game_id
          player_id
        }
      }
    `;

    const variableValues = {
      game: gameElos[0].game?.toString(),
      player: new ObjectId().toHexString(), // player with this id wont exist
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elo).toBeNull();
  });

  it('should populate game and player for a give game elo', async () => {
    const source = gql`
      query SelectGameElo($game: ObjectId!, $player: ObjectId!) {
        game_elo(player: $player, game: $game) {
          _id
          game {
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
      game: gameElos[0].game?.toString(),
      player: gameElos[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elo._id).toBe(gameElos[0].id);
    expect(output.data?.game_elo.game).toBeDefined();
    expect(output.data?.game_elo.player).toBeDefined();
    expect(output.data?.game_elo.game._id).toBe(gameElos[0].game?.toString());
    expect(output.data?.game_elo.game.name).toBe(games[0].name);
    expect(output.data?.game_elo.player._id).toBe(
      gameElos[0].player?.toString(),
    );
    expect(output.data?.game_elo.player.handle).toBe(players[0].handle);
  });

  it('should find game elos from a list of games', async () => {
    const source = gql`
      query SelectGameElos($games: [ObjectId!]) {
        game_elos(games: $games) {
          _id
          game_id
        }
      }
    `;

    const variableValues = {
      games: [games[0].id, games[1].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elos).toHaveLength(
      gameElos.filter(
        (gameElo) =>
          gameElo.game?.toString() === games[0].id ||
          gameElo.game?.toString() === games[1].id,
      ).length,
    );
    expect(
      every(
        output.data?.game_elos,
        (e) => e.game_id === games[0].id || e.game_id === games[1].id,
      ),
    ).toBe(true);
  });

  it('should find game elos from a list of players', async () => {
    const source = gql`
      query SelectGameElos($players: [ObjectId!]) {
        game_elos(players: $players) {
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
    expect(output.data?.game_elos).toHaveLength(
      gameElos.filter(
        (gameElo) =>
          gameElo.player?.toString() === players[0].id ||
          gameElo.player?.toString() === players[1].id,
      ).length,
    );
    expect(
      every(
        output.data?.game_elos,
        (e) => e.player_id === players[0].id || e.player_id === players[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if a list of games returns no results', async () => {
    const source = gql`
      query SelectGameElos($games: [ObjectId!]) {
        game_elos(games: $games) {
          _id
          game_id
        }
      }
    `;

    const variableValues = {
      games: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game_elos).toHaveLength(0);
  });

  it('should return empty array if a list of players returns no results', async () => {
    const source = gql`
      query SelectGameElos($players: [ObjectId!]) {
        game_elos(players: $players) {
          _id
          player_id
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
    expect(output.data?.game_elos).toHaveLength(0);
  });

  it('should sort by game id', async () => {
    const source = gql`
      query SortGameElos {
        game_elos(sort: GAME_ID) {
          _id
          game_id
        }
      }
    `;

    const expected = orderBy(
      gameElos.map((g) => g.game?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.game_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.game_id);

    expect(dataFromQuery).toHaveLength(gameElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort by player id', async () => {
    const source = gql`
      query SortGameElos {
        game_elos(sort: PLAYER_ID) {
          _id
          player_id
        }
      }
    `;

    const expected = orderBy(
      gameElos.map((g) => g.player?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.game_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.player_id);

    expect(dataFromQuery).toHaveLength(gameElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort by score asc', async () => {
    const source = gql`
      query SortGameElos {
        game_elos(sort: SCORE_ASC) {
          _id
          score
        }
      }
    `;

    const expected = orderBy(
      gameElos.map((g) => g.score),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.game_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.score);

    expect(dataFromQuery).toHaveLength(gameElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort by score desc', async () => {
    const source = gql`
      query SortGameElos {
        game_elos(sort: SCORE_DESC) {
          _id
          score
        }
      }
    `;

    const expected = orderBy(
      gameElos.map((g) => g.score),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.game_elos;
    const received: Array<string> = dataFromQuery.map((d) => d.score);

    expect(dataFromQuery).toHaveLength(gameElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort by id', async () => {
    const source = gql`
      query SortGameElos {
        game_elos(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      gameElos.map((g) => g.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();

    const dataFromQuery: Array<any> = output.data?.game_elos;
    const received: Array<string> = dataFromQuery.map((d) => d._id);

    expect(dataFromQuery).toHaveLength(gameElos.length);
    expect(isEqual(received, expected)).toBe(true);
  });
});
