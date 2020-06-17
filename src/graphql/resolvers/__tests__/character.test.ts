import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import {
  generateCharacter,
  generateGame,
} from '@graphql/resolvers/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some, orderBy, isEqual } from 'lodash';
import { Character, CharacterModel } from '@models/character';
import { Game, GameModel } from '@models/game';
import { ObjectId } from 'mongodb';

describe('Character GraphQL Resolver Test', () => {
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

  it('should return all characters with fields', async () => {
    const source = gql`
      query SelectAllCharacters {
        characters {
          _id
          name
          short
          game_id
          image
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toHaveLength(characters.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.characters,
        (e) =>
          some(characters, (s) => s.id === e._id) &&
          some(characters, (s) => s.name === e.name) &&
          some(characters, (s) => s.short === e.short) &&
          some(characters, (s) => s.image === e.image) &&
          some(characters, (s) => s.game?.toString() === e.game_id),
      ),
    ).toBe(true);
  });

  it('should return a single character by id', async () => {
    const source = gql`
      query SelectSingleCharacter($id: ObjectId!) {
        character(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: characters[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.character._id).toBe(characters[0].id);
    expect(output.data?.character.name).toBe(characters[0].name);
  });

  it('should return null if character id not found', async () => {
    const source = gql`
      query SelectSingleCharacterNull($id: ObjectId!) {
        character(id: $id) {
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
    expect(output.data?.character).toBeNull();
  });

  it('should populate game for a given character', async () => {
    const source = gql`
      query SelectSingleCharacter($id: ObjectId!) {
        character(id: $id) {
          _id
          name
          game {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: characters[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.character._id).toBe(characters[0].id);
    expect(output.data?.character.name).toBe(characters[0].name);

    expect(output.data?.character.game).toBeDefined();
    // check game id and name exist in games array
    expect(some(games, (g) => g.id === output.data?.character.game._id)).toBe(
      true,
    );
    expect(
      some(games, (g) => g.name === output.data?.character.game.name),
    ).toBe(true);
  });

  it('should sort character by name asc', async () => {
    const source = gql`
      query SortCharacterNameAsc {
        characters(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      characters.map((b) => b.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toHaveLength(characters.length);

    const dataFromQuery: Array<any> = output.data?.characters;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort character by name desc', async () => {
    const source = gql`
      query SortCharacterNameDesc {
        characters(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      characters.map((b) => b.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toHaveLength(characters.length);

    const dataFromQuery: Array<any> = output.data?.characters;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort character by game id asc', async () => {
    const source = gql`
      query SortCharacterGameId {
        characters(sort: GAME_ID) {
          _id
          game_id
        }
      }
    `;

    const expected = orderBy(
      characters.map((b) => b.game?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toHaveLength(characters.length);

    const dataFromQuery: Array<any> = output.data?.characters;
    const received: Array<string> = dataFromQuery.map((p) => p.game_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort character by id', async () => {
    const source = gql`
      query SortCharacterId {
        characters(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      characters.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toHaveLength(characters.length);

    const dataFromQuery: Array<any> = output.data?.characters;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search characters by name', async () => {
    const source = gql`
      query SearchCharactersByName($search: String!) {
        characters(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: characters[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toBeDefined();
    expect(output.data?.characters).toHaveLength(1);
    expect(output.data?.characters[0]._id).toBe(characters[0].id);
    expect(output.data?.characters[0].name).toBe(characters[0].name);
  });

  it('should return empty array if search characters by name returns no results', async () => {
    const source = gql`
      query SearchCharactersByName($search: String!) {
        characters(search: $search) {
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
    expect(output.data?.characters).toBeDefined();
    expect(output.data?.characters).toHaveLength(0);
  });

  it('should search characters by list of ids', async () => {
    const source = gql`
      query CharactersByIds($ids: [ObjectId!]) {
        characters(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: characters.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.characters).toBeDefined();
    expect(output.data?.characters).toHaveLength(characters.length);
  });

  it('should return empty array if search characters by list of ids returns no results', async () => {
    const source = gql`
      query CharactersByIds($ids: [ObjectId!]) {
        characters(ids: $ids) {
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
    expect(output.data?.characters).toBeDefined();
    expect(output.data?.characters).toHaveLength(0);
  });

  it.todo('should populate match vods for a given character');

  it.todo(
    'should return empty array if no match vods found for given character',
  );
});
