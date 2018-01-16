import { success, notFound } from '../../services/response/'
import { Series } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  {
    console.log(body)
    Series.create(body)
    .then((series) => series.view(true))
    .then(success(res, 201))
    .catch(next)
  }

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Series.find(query, select, cursor)
    .then((series) => series.map((series) => series.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Series.findById(params.id)
    .then(notFound(res))
    .then((series) => series ? series.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Series.findById(params.id)
    .then(notFound(res))
    .then((series) => series ? Object.assign(series, body).save() : null)
    .then((series) => series ? series.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Series.findById(params.id)
    .then(notFound(res))
    .then((series) => series ? series.remove() : null)
    .then(success(res, 204))
    .catch(next)
