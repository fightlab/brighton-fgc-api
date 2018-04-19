import { AuthenticationClient } from 'auth0'

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID
})

export const getProfile = accessToken => new Promise((resolve, reject) => {
  auth0.getProfile(accessToken, (err, profile) => {
    if (err) return reject(err)
    return resolve(profile)
  })
})
