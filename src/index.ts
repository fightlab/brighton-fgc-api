import { default as mongoose } from '@lib/mongoose';
import { default as express } from '@lib/express';
import { getConfig } from '@lib/config';

const { mongo, port } = getConfig();

// get express server with all middleware enabled
const server = express();

// connect to the mongo database
mongoose.connect(mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// start the express server
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
