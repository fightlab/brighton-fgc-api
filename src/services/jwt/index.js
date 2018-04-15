import jwt from 'express-jwt'
import jwks from 'jwks-rsa'

export const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://mkn-sh.eu.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://api.hbk.gg',
  issuer: 'https://mkn-sh.eu.auth0.com/',
  algorithms: ['RS256']
})
