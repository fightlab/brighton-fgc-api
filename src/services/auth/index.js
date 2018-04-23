import { createHash } from 'crypto'
import { find, get } from 'lodash'
import { jwtCheck } from '../jwt'
import { getProfile, getHashFromProfile } from '../auth0'
import { forbidden, unauthorized } from '../response'

const isAuthenticated = [
  (req, res, next) => {
    if (req.query && req.query.hasOwnProperty('access_token')) {
      if (req.query.access_token) {
        req.headers.authorization = 'Bearer ' + req.query.access_token
      }
    }

    if (!req.headers.authorization || (process.env.NODE_ENV === 'test' && req.headers.authorization !== 'Bearer admin' && req.headers.authorization !== 'Bearer user')) {
      return forbidden(res)()
    }
    return next()
  },
  process.env.NODE_ENV === 'test' ? (req, res, next) => next() : jwtCheck,
  (req, res, next) => {
    req.access_token = req.headers.authorization.replace('Bearer ', '')
    return next()
  }
]

const isAuthenticatedWithProfile = [
  ...isAuthenticated,
  async (req, res, next) => {
    // for testing
    if (process.env.NODE_ENV === 'test' && req.access_token === 'admin') {
      req.profile = {
        roles: ['user', 'admin'],
        emailHash: createHash('md5').update('admin').digest('hex')
      }
    } else if (process.env.NODE_ENV === 'test' && req.access_token === 'user') {
      req.profile = {
        roles: ['user'],
        emailHash: createHash('md5').update('user').digest('hex')
      }
    } else {
      try {
        req.profile = await getProfile(req.access_token)
      } catch (error) {
        return next(error)
      }
    }
    req.emailHash = getHashFromProfile(req.profile)
    return next()
  }
]

const isAdmin = [
  ...isAuthenticatedWithProfile,
  (req, res, next) => {
    if (!req.profile) {
      return forbidden(res)()
    }
    const keys = Object.keys(req.profile)
    const key = find(keys, v => v.indexOf('roles') !== -1) || ''
    const roles = get(req.profile, key, ['user'])
    const isAdmin = !!find(roles, role => role === 'admin', false)
    if (isAdmin) {
      return next()
    }
    return unauthorized(res)()
  }
]

export { isAuthenticated, isAuthenticatedWithProfile, isAdmin }
