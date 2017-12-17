import { success, notFound } from '../../services/response/'
import { Tournament } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Tournament.create(body)
    .then((tournament) => tournament.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Tournament.find(query, select, cursor)
    .then((tournaments) => tournaments.map((tournament) => tournament.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Tournament.findById(params.id)
    .then(notFound(res))
    .then((tournament) => tournament ? tournament.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Tournament.findById(params.id)
    .then(notFound(res))
    .then((tournament) => tournament ? Object.assign(tournament, body).save() : null)
    .then((tournament) => tournament ? tournament.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Tournament.findById(params.id)
    .then(notFound(res))
    .then((tournament) => tournament ? tournament.remove() : null)
    .then(success(res, 204))
    .catch(next)
