import { success, notFound } from '../../services/response/'
import { Event } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Event.create(body)
    .then((event) => event.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Event.find(query)
    .then((events) => events.map((event) => event.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Event.findById(params.id)
    .then(notFound(res))
    .then((event) => event ? event.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Event.findById(params.id)
    .then(notFound(res))
    .then((event) => event ? Object.assign(event, body).save() : null)
    .then((event) => event ? event.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Event.findById(params.id)
    .then(notFound(res))
    .then((event) => event ? event.remove() : null)
    .then(success(res, 204))
    .catch(next)
