import { Request, Response } from 'express';
import { default as mongoose } from '@lib/mongoose';
import { default as express } from '@lib/express';
import { getConfig } from '@lib/config';

import { fakeData } from '@lib/faker';
import { makeApolloServer } from '@lib/graphql';

const { mongo, port, seedDB, env } = getConfig();

// startup function
const main = async () => {
  // get express app with all middleware enabled
  const app = express();

  // get the graphql server, and add express app
  const server = await makeApolloServer();
  server.applyMiddleware({ app });

  // default 404 route for all request methods
  app.use((_: Request, res: Response) => {
    return res.sendStatus(404);
  });

  // connect to the mongo database
  mongoose.connect(mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // start the express server
  app.listen(port, async () => {
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(
      `GraphQL server ready on port ${port} at path ${server.graphqlPath}`,
    );

    // fake some data for development, if needed
    if (seedDB) {
      await fakeData();
    }
  });
};

// run main function
main();
