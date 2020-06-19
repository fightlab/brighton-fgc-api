import { default as jwt } from 'express-jwt';
import { default as jwks } from 'jwks-rsa';
import { getConfig } from '@lib/config';

const { auth0 } = getConfig();

export const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${auth0.issuer}.well-known/jwks.json`,
  }),
  audience: auth0.audience,
  issuer: auth0.issuer,
  algorithms: ['RS256'],
  // this disables auth0
  credentialsRequired: auth0.enabled,
});
