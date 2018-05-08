
import _ from 'lodash'
import { success, notFound, badImplementation } from '../../../services/response/'
import Match from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Match.create(body)
    .then(match => match.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))

export const index = (req, res, next) =>
  Match.find({})
    .then((matches) => matches.map((match) => match.view()))
    .then(success(res))
    .catch(badImplementation(res))

export const show = ({ params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? match.view() : null)
    .then(success(res))
    .catch(badImplementation(res))

export const update = ({ bodymen: { body }, params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? Object.assign(match, body).save() : null)
    .then((match) => match ? match.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const destroy = ({ params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? match.remove() : null)
    .then(success(res, 204))
    .catch(badImplementation(res))

export const count = (req, res, next) =>
  Match
    .count()
    .then(success(res))
    .catch(next)

export const countGames = (req, res, next) =>
  Match
    .find()
    .select('score')
    .then(matches => _(matches).sumBy(match => _(match.score).sumBy(score => score.p1 + score.p2)))
    .then(success(res))
    .catch(next)
