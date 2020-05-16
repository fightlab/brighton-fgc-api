import { default as mongoose } from '@lib/mongoose';
import { default as express } from '@lib/express';
import { getConfig } from '@lib/config';

import { fakeData } from '@lib/faker';

const { mongo, port, seedDB } = getConfig();
// get express server with all middleware enabled
const server = express();

// connect to the mongo database
mongoose.connect(mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// start the express server
server.listen(port, async () => {
  console.log(`Server started on port ${port}`);

  // fake some data for development, if needed
  if (seedDB) {
    await fakeData();
  }
});
