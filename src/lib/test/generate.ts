import faker from 'faker';
import { BracketPlatform } from '@models/bracket_platform';

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
