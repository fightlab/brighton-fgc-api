import { gqlCall } from '@graphql/resolvers/test/helper';
import { generateGame } from '@lib/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some } from 'lodash';
import { Game, GameModel } from '@models/game';

describe('Game GraphQL Resolver Test', () => {
  let games: Array<DocumentType<Game>>;

  beforeEach(async () => {
    games = await GameModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateGame(false),
      ) as Array<Game>,
    );
  });

  it('should return all games with fields', async () => {
    const source = `
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
    expect(() =>
      every(
        output.data?.games,
        (e) =>
          some(games, (s) => s.id === e._id) &&
          some(games, (s) => s.name === e.name) &&
          some(games, (s) => s.short === e.short) &&
          some(games, (s) => s.logo === e.logo) &&
          some(games, (s) => s.bg === e.bg),
      ),
    );
  });

  it('should return a single game by id', async () => {
    const source = `
      query SelectSingleGame($id: ObjectId!) {
        game(id:$id) {
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
    const source = `
      query SelectSingleGameNull($id: ObjectId!) {
        game(id:$id) {
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
});
