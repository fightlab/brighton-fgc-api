/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { default as mongoose } from '@lib/mongoose';
import { fakeData } from '@lib/faker';

const mongoServer = new MongoMemoryServer({
  instance: {
    dbName: 'jest',
  },
  binary: {
    version: 'latest',
  },
  autoStart: false,
});

EventEmitter.defaultMaxListeners = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

global.Array = Array;
global.Date = Date;
global.Function = Function;
global.Math = Math;
global.Number = Number;
global.Object = Object;
global.RegExp = RegExp;
global.String = String;
global.Uint8Array = Uint8Array;
global.WeakMap = WeakMap;
global.Set = Set;
global.Error = Error;
global.TypeError = TypeError;
global.parseInt = parseInt;
global.parseFloat = parseFloat;

beforeAll(async () => {
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(
    mongoUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) console.error(err);
    },
  );

  // generate some fake data
  await fakeData();
});

afterAll(async () => {
  const { collections } = mongoose.connection;
  const promises: Array<Promise<any>> = [];
  Object.keys(collections).forEach((collection) => {
    promises.push(collections[collection].deleteMany({}));
  });
  await Promise.all(promises);

  await mongoose.disconnect();
  await mongoServer.stop();
});
