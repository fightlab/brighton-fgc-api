/* eslint-disable @typescript-eslint/no-explicit-any */

// USED FOR TESTING AND EARLY DEVELOPMENT ONLY
// TO GENERATE FAKE DATA FOR MONGOOSE
// WARNING WILL REMOVE ALL DATA FROM MONGO ON STARTUP AND SEED IT

import faker from 'faker';
import mongoose from '@lib/mongoose';
import { startCase } from 'lodash';

// import all the models and interfaces;
import { IGame, Game } from '@models/game';

// set faker locale to something we're used to
faker.locale = 'en_GB';

interface DataLengths {
  game: number;
}

export const dataLengthsDefault: DataLengths = {
  game: 6,
};

export const fakeData: (dataLengths?: DataLengths) => Promise<boolean> = async (
  dataLengths = dataLengthsDefault,
) => {
  // remove all data from collections
  const { collections } = mongoose.connection;
  const promises: Array<Promise<any>> = [];
  Object.keys(collections).forEach((collection) => {
    promises.push(collections[collection].deleteMany({}));
  });
  await Promise.all(promises);

  // generate games
  const games: Array<IGame> = Array.from({ length: dataLengths.game }, () => {
    const name = startCase(
      faker.random.words(
        faker.random.number({
          max: 5,
          min: 1,
        }),
      ),
    );

    return {
      name,
      short: name
        .split(' ')
        .map((w) => w[0])
        .join(''),
      bg: faker.random.boolean() ? faker.image.imageUrl() : undefined,
      logo: faker.random.boolean() ? faker.image.imageUrl() : undefined,
      meta: faker.random.boolean()
        ? faker.lorem.words(
            faker.random.number({
              max: 100,
              min: 10,
            }),
          )
        : undefined,
    };
  });
  // add games to db
  await Game.create(games);

  return true;
};
