import { gqlCall } from '@graphql/resolvers/test/helper';
import { generateCharacter, generateGame } from '@lib/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some } from 'lodash';
import { Character, CharacterModel } from '@models/character';
import { Game, GameModel } from '@models/game';

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
    const source = `
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
    const source = `
      query SelectSingleCharacter($id: ObjectId!) {
        character(id:$id) {
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
    const source = `
      query SelectSingleCharacterNull($id: ObjectId!) {
        character(id:$id) {
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
    const source = `
    query SelectSingleCharacter($id: ObjectId!) {
      character(id:$id) {
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
});
