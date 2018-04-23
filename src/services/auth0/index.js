import { AuthenticationClient } from 'auth0'
import { find, get } from 'lodash'

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

export const getHashFromProfile = (profile = {}) => {
  const keys = Object.keys(profile)
  const key = find(keys, v => v.indexOf('emailHash') !== -1) || ''
  return get(profile, key, '')
}
