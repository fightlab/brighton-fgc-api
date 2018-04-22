import { Types } from 'mongoose'

import { success, notFound, badImplementation } from '../../../services/response/'
import Game from '.'
import Tournament from '../tournament'

const ObjectId = Types.ObjectId

export const create = ({ bodymen: { body } }, res, next) =>
  Game.create(body)
    .then((game) => game.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))

export const index = (req, res, next) =>
  Game.find({})
    .then((games) => games.map((game) => game.view()))
    .then(success(res))
    .catch(badImplementation(res))

export const show = ({ params }, res, next) =>
  Game.findById(params.id)
    .then(notFound(res))
    .then((game) => game ? game.view() : null)
    .then(success(res))
    .catch(badImplementation(res))

export const update = ({ bodymen: { body }, params }, res, next) =>
  Game.findById(params.id)
    .then(notFound(res))
    .then((game) => game ? Object.assign(game, body).save() : null)
    .then((game) => game ? game.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const destroy = ({ params }, res, next) =>
  Game.findById(params.id)
    .then(notFound(res))
    .then((game) => game ? game.remove() : null)
    .then(success(res, 204))
    .catch(badImplementation(res))

export const tournaments = ({ params }, res, next) =>
  Tournament.find({ _gameId: ObjectId(params.id) })
    .populate({
      path: '_gameId',
      select: 'name id'
    })
    .then(tournaments => tournaments.map(tournament => tournament.view()))
    .then(success(res))
    .catch(next)
