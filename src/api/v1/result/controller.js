
import { success, notFound, badImplementation } from '../../../services/response/'
import Result from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Result.create(body)
    .then(result => result.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))

export const index = (req, res, next) =>
  Result.find({})
    .then(results => results.map(result => result.view()))
    .then(success(res))
    .catch(badImplementation(res))

export const show = ({ params }, res, next) =>
  Result.findById(params.id)
    .then(notFound(res))
    .then(result => result ? result.view() : null)
    .then(success(res))
    .catch(badImplementation(res))

export const update = ({ bodymen: { body }, params }, res, next) =>
  Result.findById(params.id)
    .then(notFound(res))
    .then(result => result ? Object.assign(result, body).save() : null)
    .then(result => result ? result.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const destroy = ({ params }, res, next) =>
  Result.findById(params.id)
    .then(notFound(res))
    .then(result => result ? result.remove() : null)
    .then(success(res, 204))
    .catch(badImplementation(res))
