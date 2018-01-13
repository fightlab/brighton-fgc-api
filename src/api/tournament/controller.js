import { success, notFound } from '../../services/response/'
import { Tournament } from '.'
import { Match } from '../match'
import { Result } from '../result'
import { Types } from 'mongoose'

const ObjectId = Types.ObjectId

export const create = ({ bodymen: { body } }, res, next) =>
  Tournament.create(body)
    .then((tournament) => tournament.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ query }, res, next) =>
  Tournament.find(query)
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
  Tournament
    .findById(params.id)
    .then(notFound(res))
    .then((tournament) => tournament ? tournament.remove() : null)
    .then(new Promise((resolve, reject) => {
      const proms = []
      // remove matches
      proms.push(new Promise((resolve, reject) => Match
        .remove({
          _tournamentId: ObjectId(params.id)
        })
        .then(resolve)
        .catch(reject)
      ))

      // remove result
      proms.push(new Promise((resolve, reject) => Result
        .remove({
          _tournamentId: ObjectId(params.id)
        })
        .then(resolve)
        .catch(reject)
      ))

      Promise
        .all(proms)
        .then(resolve)
        .catch(reject)
    }))
    .then(success(res, 204))
    .catch(next)
