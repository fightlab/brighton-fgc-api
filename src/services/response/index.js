import Boom from '@hapi/boom'

// 200
export const success = (res, status) => entity => {
  if (entity) res.status(status || 200).json(entity)
  return null
}

// 400
export const badRequest = res => message => {
  res.status(400).json(Boom.badRequest(message)).end()
  return null
}

// 401
export const forbidden = res => message => {
  res.status(401).json(Boom.forbidden(message)).end()
  return null
}

// 403
export const unauthorized = res => message => {
  res.status(403).json(Boom.unauthorized(message)).end()
  return null
}

// 404
export const notFound = (res, message) => entity => {
  if (entity) return entity
  res.status(404).json(Boom.notFound(message)).end()
  return null
}

// 422
export const badData = res => message => {
  res.status(422).json(Boom.badData(message)).end()
  return null
}

// 500
export const badImplementation = res => err => {
  console.error(err)
  const error = Boom.boomify(new Error(err))
  res.status(500).json(error).end()
  return null
}
