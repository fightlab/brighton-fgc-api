import { find, get } from 'lodash'
import { jwtCheck } from '../jwt'
import { getProfile } from '../auth0'
import { forbidden, unauthorized } from '../response'

const isAuthenticated = [
  (req, res, next) => {
    if (req.query && req.query.hasOwnProperty('access_token')) {
      if (req.query.access_token) {
        req.headers.authorization = 'Bearer ' + req.query.access_token
      }
    }
    return next()
  },
  jwtCheck,
  (req, res, next) => {
    req.access_token = req.headers.authorization.replace('Bearer ', '')
    return next()
  }
]

const isAuthenticatedWithProfile = [
  ...isAuthenticated,
  async (req, res, next) => {
    try {
      req.profile = await getProfile(req.access_token)
      return next()
    } catch (error) {
      return next(error)
    }
  }
]

const isAdmin = [
  ...isAuthenticatedWithProfile,
  (req, res, next) => {
    if (!req.profile) {
      return unauthorized(res)()
    }
    const keys = Object.keys(this.profile)
    const key = find(keys, v => v.indexOf('roles') !== -1) || ''
    const roles = get(this.profile, key, ['user'])
    const isAdmin = !!find(roles, role => role === 'admin', false)
    if (isAdmin) {
      return next()
    }
    return forbidden(res)()
  }
]

export { isAuthenticated, isAuthenticatedWithProfile, isAdmin }
