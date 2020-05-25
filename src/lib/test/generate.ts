import faker from 'faker';
import { BracketPlatform } from '@models/bracket_platform';
import { Game } from '@models/game';

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
