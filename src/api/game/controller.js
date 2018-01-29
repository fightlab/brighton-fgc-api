import { Types } from 'mongoose'
import _ from 'lodash'

import { success, notFound } from '../../services/response/'
import { Game } from '.'
import { Tournament } from '../tournament'
import { Result } from '../result'

const ObjectId = Types.ObjectId
const Scores = [0, 16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1]

export const create = ({ bodymen: { body } }, res, next) =>
  Game.create(body)
    .then((game) => game.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Game.find(query)
    .then((games) => games.map((game) => game.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Game.findById(params.id)
    .then(notFound(res))
    .then((game) => game ? game.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Game.findById(params.id)
    .then(notFound(res))
    .then((game) => game ? Object.assign(game, body).save() : null)
    .then((game) => game ? game.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Game.findById(params.id)
    .then(notFound(res))
    .then((game) => game ? game.remove() : null)
    .then(success(res, 204))
    .catch(next)

export const showTournaments = ({ params }, res, next) =>
  Tournament.find({ _gameId: ObjectId(params.id) })
    .populate({
      path: '_gameId',
      select: 'name id'
    })
    .then(tournaments => tournaments.map(tournament => tournament.view()))
    .then(success(res))
    .catch(next)

export const getStandings = async ({ params, query }, res, next) => {
  try {
    ObjectId(params.id)
  } catch (e) {
    return res.status(400).json(e)
  }

  const tournaments = await Tournament
    .find({ _gameId: ObjectId(params.id) })
    .select('id')
    .catch(next)

  const results = await Result
    .aggregate([{
      $match: {
        _tournamentId: {
          $in: _.map(tournaments, t => ObjectId(t.id))
        }
      }
    }, {
      $group: {
        _id: '$_playerId',
        rank: { $push: '$rank' }
      }
    }, {
      $lookup: {
        from: 'players',
        localField: '_id',
        foreignField: '_id',
        as: '_playerId'
      }
    }, {
      $unwind: '$_playerId'
    }, {
      $project: {
        id: '$_id',
        _playerId: {
          handle: '$_playerId.handle',
          emailHash: '$_playerId.emailHash'
        },
        rank: 1
      }
    }])
    .exec()
    .catch(next)

  let standings = _(results)
    .map(v => ({
      id: v.id,
      _playerId: v._playerId,
      rank: _(v.rank).map(r => Scores[r] || 0).sum()
    }))
    .orderBy('rank', 'desc')
    .value()

  if (query.limit) {
    standings = _.take(standings, parseInt(query.limit))
  }

  return success(res)(standings)
}
