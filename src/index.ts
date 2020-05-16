import { default as mongoose } from '@lib/mongoose';
import { default as express } from '@lib/express';

// get express server with all middleware enabled
const server = express();

// connect to the mongo database
mongoose.connect(process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// start the express server
server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
