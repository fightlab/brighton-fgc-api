import { Request, Response, NextFunction } from 'express';
import { default as jwt } from 'express-jwt';
import { default as jwks } from 'jwks-rsa';
import { getConfig } from '@lib/config';
import { ROLES } from './graphql';

export interface User {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
  azp?: string;
  scope: string;
  permissions: string[];
}

export interface ResponseWithLocals extends Response {
  locals: {
    user?: User;
  };
}

const { auth0 } = getConfig();

export const getJwtCheck = (): ((
  _: Request,
  __: Response,
  next: NextFunction,
) => void) => {
  // if auth0 not enabled, simply return middleware that passes onto next resolver
  // with an admin user
  if (!auth0.enabled) {
    return (_: Request, res: ResponseWithLocals, next: NextFunction) => {
      res.locals.user = {
        scope: ROLES.ADMIN,
        permissions: [ROLES.ADMIN],
      } as User;

      return next();
    };
  }

  // otherwise return the jwt check middleware
  return jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${auth0.issuer}.well-known/jwks.json`,
    }),
    audience: auth0.audience,
    issuer: auth0.issuer,
    algorithms: ['RS256'],
    credentialsRequired: false,
  });
};
