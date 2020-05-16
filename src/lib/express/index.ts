import { default as express, Express, Request, Response } from 'express';
import { default as helmet } from 'helmet';
import { default as cors } from 'cors';
import { default as bodyParser } from 'body-parser';
import { default as compression } from 'compression';
import { default as morgan } from 'morgan';

export default () => {
  const app: Express = express();

  // Express.js security with HTTP headers - https://helmetjs.github.io/
  app.use(helmet());

  // enabling CORS - https://expressjs.com/en/resources/middleware/cors.html
  app.use(cors());

  // compress responses - http://expressjs.com/en/resources/middleware/compression.html
  app.use(compression());

  // parse incoming body - http://expressjs.com/en/resources/middleware/body-parser.html
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // logging using morgan -http://expressjs.com/en/resources/middleware/morgan.html
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // healthcheck endpoint for all request methods
  app.use('/healthcheck', (_: Request, res: Response) => {
    return res.sendStatus(200);
  });

  // default 404 route for all request methods
  app.use((_: Request, res: Response) => {
    return res.sendStatus(404);
  });

  return app;
};
