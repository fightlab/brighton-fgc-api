// All express related things, returns function which returns an instance
// of an express app with all middleware included

import { default as express, Express, Request, Response } from 'express';
import { default as helmet } from 'helmet';
import { default as cors } from 'cors';
import { default as bodyParser } from 'body-parser';
import { default as compression } from 'compression';
import { default as morgan } from 'morgan';
import { getConfig } from '@lib/config';

const { isDev } = getConfig();

export default (): Express => {
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

  // logging using morgan - http://expressjs.com/en/resources/middleware/morgan.html
  if (isDev()) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // index route, return name and version
  app.get('/', (_: Request, res: Response) => {
    res.status(200).send(`HBK - API | ${process.env.npm_package_version}`);
  });

  // add version endpoint to get api version
  app.get('/version', (_: Request, res: Response) =>
    res.status(200).send(process.env.npm_package_version),
  );

  // healthcheck endpoint for all request methods
  app.use('/healthcheck', (_: Request, res: Response) => {
    return res.sendStatus(200);
  });

  return app;
};
