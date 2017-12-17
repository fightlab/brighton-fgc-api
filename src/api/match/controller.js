import { success, notFound } from '../../services/response/'
import { Match } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Match.create(body)
    .then((match) => match.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Match.find(query, select, cursor)
    .then((matches) => matches.map((match) => match.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? match.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? Object.assign(match, body).save() : null)
    .then((match) => match ? match.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? match.remove() : null)
    .then(success(res, 204))
    .catch(next)
