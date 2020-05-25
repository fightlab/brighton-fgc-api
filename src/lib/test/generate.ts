import faker from 'faker';
import { BracketPlatform } from '@models/bracket_platform';
import { Game } from '@models/game';
import { ObjectId } from 'mongodb';
import { Character } from '@models/character';

export const generateBracketPlatform = (min = true): BracketPlatform => {
  const obj: BracketPlatform = {
    name: faker.company.companyName(),
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    url: faker.internet.url(),
    api_url: faker.internet.url(),
    api_docs: faker.internet.url(),
    meta: {
      info: faker.hacker.phrase(),
    },
  };
};

export const generateGame = (min = true): Game => {
  const obj: Game = {
    name: faker.hacker.noun(),
    short: faker.hacker.abbreviation(),
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    logo: faker.image.imageUrl(),
    bg: faker.image.imageUrl(),
    meta: {
      info: faker.hacker.phrase(),
    },
  };
};

export const generateCharacter = (game: ObjectId, min = true): Character => {
  const obj: Character = {
    name: faker.name.findName(),
    short: faker.name.firstName(),
    game,
  };

  if (min) {
    return obj;
  }

  return {
    ...obj,
    image: faker.image.avatar(),
  };
};
