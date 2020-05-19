import { MongoMemoryServer } from 'mongodb-memory-server';
import { default as mongoose } from '@lib/mongoose';

// set up mongo server
const mongoServer = new MongoMemoryServer({
  instance: {
    dbName: 'jest',
  },
  binary: {
    version: 'latest',
  },
  autoStart: false,
});

// allow enough time to download mongo memory server
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

// before all tests connect to the mongo memory db
beforeAll(async () => {
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(
    mongoUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    },
  );
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  const promises: Array<Promise<any>> = Object.keys(
    collections,
  ).map((collection) => collections[collection].deleteMany({}));
  await Promise.all(promises);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
