import { default as faker } from 'faker';
import { DocumentType, isDocument } from '@typegoose/typegoose';
import { CharacterModel, Character } from '@models/character';
import { GameModel, Game } from '@models/game';

describe('Character model test', () => {
  let games: Array<DocumentType<Game>>;
  let characterFull: Character;
  let characterMin: Character;
  let character: DocumentType<Character>;

  beforeEach(async () => {
    // fake some games
    games = await GameModel.create([
      {
        name: 'Game #1',
        short: 'G1',
      },
      {
        name: 'Game #2',
        short: 'G2',
      },
    ] as Array<Game>);

    characterFull = {
      game: games[0]._id,
      name: faker.name.findName(),
      short: faker.name.firstName(),
      image: faker.image.avatar(),
    };

    characterMin = {
      game: games[1]._id,
      name: faker.name.findName(),
      short: faker.name.firstName(),
    };

    [character] = await CharacterModel.create([
      {
        game: games[0]._id,
        name: 'Another Waifu',
        short: 'WAIFU',
      },
    ] as Array<Character>);
  });

  it('should create & save character successfully', async () => {
    const input = new CharacterModel(characterFull);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output.game)).toBe(false);

    expect(output.game?.toString()).toBe(characterFull.game?.toString());
    expect(output.game?.toString()).toBe(games[0]._id.toString());
    expect(output.name).toBe(characterFull.name);
    expect(output.short).toBe(characterFull.short);
    expect(output.image).toBe(characterFull.image);
  });

  it('create & save minimum character successfully', async () => {
    const input = new CharacterModel(characterMin);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output.game)).toBe(false);

    expect(output.game?.toString()).toBe(characterMin.game?.toString());
    expect(output.game?.toString()).toBe(games[1]._id.toString());
    expect(output.name).toBe(characterMin.name);
    expect(output.short).toBe(characterMin.short);
    expect(output.image).toBeUndefined();
  });

  it('should populate game', async () => {
    const output = await CharacterModel.findById(character._id).populate(
      'game',
    );
    expect(isDocument(output?.game)).toBe(true);
    if (isDocument(output?.game)) {
      expect(output?.game.id).toBe(games[0].id);
      expect(output?.game.name).toBe(games[0].name);
    }
  });
});
