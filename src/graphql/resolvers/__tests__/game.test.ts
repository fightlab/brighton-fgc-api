import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import { generateGame, generateCharacter } from '@lib/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some, orderBy, isEqual } from 'lodash';
import { Game, GameModel } from '@models/game';
import { Character, CharacterModel } from '@models/character';
import { ObjectId } from 'mongodb';

describe('Game GraphQL Resolver Test', () => {
  let games: Array<DocumentType<Game>>;
  let characters: Array<DocumentType<Character>>;
  const charactersToGeneratePerGame = 3;

  beforeEach(async () => {
    games = await GameModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateGame(false),
      ) as Array<Game>,
    );

    characters = await CharacterModel.create(
      Array.from(
        {
          length: games.length * charactersToGeneratePerGame,
        },
        (_, i) => generateCharacter(games[i % games.length]._id, false),
      ),
    );
  });

  it('should return all games with fields', async () => {
    const source = gql`
      query SelectAllGames {
        games {
          _id
          name
          short
          logo
          bg
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toHaveLength(games.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.games,
        (e) =>
          some(games, (s) => s.id === e._id) &&
          some(games, (s) => s.name === e.name) &&
          some(games, (s) => s.short === e.short) &&
          some(games, (s) => s.logo === e.logo) &&
          some(games, (s) => s.bg === e.bg),
      ),
    ).toBe(true);
  });

  it('should return a single game by id', async () => {
    const source = gql`
      query SelectSingleGame($id: ObjectId!) {
        game(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: games[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.game._id).toBe(games[0].id);
    expect(output.data?.game.name).toBe(games[0].name);
  });

  it('should return null if game id not found', async () => {
    const source = gql`
      query SelectSingleGameNull($id: ObjectId!) {
        game(id: $id) {
          _id
          name
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
    expect(output.data?.game).toBeNull();
  });

  it('should populate characters for a game', async () => {
    const source = gql`
      query SelectSingleGameNull($id: ObjectId!) {
        game(id: $id) {
          _id
          name
          characters {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: games[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    // standard check
    expect(output.data).toBeDefined();
    expect(output.data?.game._id).toBe(games[0].id);
    expect(output.data?.game.name).toBe(games[0].name);

    // check characters
    expect(output.data?.game.characters).toBeDefined();
    expect(output.data?.game.characters).toHaveLength(
      charactersToGeneratePerGame,
    );
    // check characters exist in characters array
    expect(
      every(
        output.data?.game.characters,
        (e) =>
          some(characters, (s) => s.id === e._id) &&
          some(characters, (s) => s.name === e.name),
      ),
    ).toBe(true);
  });

  it('should return empty array if characters dont exist for a game', async () => {
    const [game] = await GameModel.create([generateGame()]);

    const source = gql`
      query SelectSingleGameNull($id: ObjectId!) {
        game(id: $id) {
          _id
          name
          characters {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: game.id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    // standard check
    expect(output.data).toBeDefined();
    expect(output.data?.game._id).toBe(game.id);
    expect(output.data?.game.name).toBe(game.name);

    // check characters
    expect(output.data?.game.characters).toBeDefined();
    expect(output.data?.game.characters).toHaveLength(0);
  });

  it('should sort games by name asc', async () => {
    const source = gql`
      query SortGamesNameAsc {
        games(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      games.map((b) => b.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toHaveLength(games.length);

    const dataFromQuery: Array<any> = output.data?.games;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort games by name desc', async () => {
    const source = gql`
      query SortGamesNameDesc {
        games(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      games.map((b) => b.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toHaveLength(games.length);

    const dataFromQuery: Array<any> = output.data?.games;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort games by id', async () => {
    const source = gql`
      query SortGamesNameDesc {
        games(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      games.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toHaveLength(games.length);

    const dataFromQuery: Array<any> = output.data?.games;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search games by name', async () => {
    const source = gql`
      query SearchGamesByName($search: String!) {
        games(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: games[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toBeDefined();
    expect(output.data?.games).toHaveLength(1);
    expect(output.data?.games[0]._id).toBe(games[0].id);
    expect(output.data?.games[0].name).toBe(games[0].name);
  });

  it('should return empty array if search games by name returns no results', async () => {
    const source = gql`
      query SearchGamesByName($search: String!) {
        games(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // use unintelligible string, highly unlikely it will be an actual name
      search: 'qqweqewcnoiaskhfnoihoiehtiohfoigafio',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toBeDefined();
    expect(output.data?.games).toHaveLength(0);
  });

  it('should search games by list of ids', async () => {
    const source = gql`
      query GamesByIds($ids: [ObjectId!]) {
        games(ids: $ids) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      ids: games.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.games).toBeDefined();
    expect(output.data?.games).toHaveLength(games.length);
  });

  it('should return empty array if search games by list of ids returns no results', async () => {
    const source = gql`
      query GamesByIds($ids: [ObjectId!]) {
        games(ids: $ids) {
          _id
          name
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
    expect(output.data?.games).toBeDefined();
    expect(output.data?.games).toHaveLength(0);
  });
});
