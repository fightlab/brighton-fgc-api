import { Types } from 'mongoose'

import { success, notFound } from '../../services/response/'
import { Player } from '.'
import { Result } from '../result'
import { Match } from '../match'
import { Tournament } from '../tournament'

const ObjectId = Types.ObjectId

export const create = ({ bodymen: { body } }, res, next) =>
  Player.create(body)
    .then((player) => player.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ query }, res, next) => {
  // query
  const $match = { 'challongeUsername': { $exists: true } }

  // cursor
  const c = {
    sort: {
      handle: 1
    }
  }

  if (query.all) {
    delete $match.challongeUsername
  }

  if (query.staff) {
    $match.isStaff = { $exists: true }
  }

  if (query.limit) {
    c.limit = parseInt(query.limit) || 4
  }

  return Player.find($match, {}, c)
    .then((players) => players.map((player) => player.view()))
    .then(success(res))
    .catch(next)
}

export const indexPlayers = ({ query }, res, next) => {
  // query
  const $match = { 'challongeUsername': { $exists: true } }
  let $limit = 999

  if (query.all) {
    delete $match.challongeUsername
  }

  if (query.staff) {
    $match.isStaff = { $exists: true }
  }

  if (query.limit) {
    $limit = parseInt(query.limit) || 4
  }

  return Player
    .aggregate([{
      $match
    }, {
      $lookup: {
        from: 'tournaments',
        localField: '_id',
        foreignField: 'players',
        as: 'tournaments'
      }
    }, {
      $project: {
        _id: '$_id',
        handle: '$handle',
        challongeUsername: '$challongeUsername',
        emailHash: '$emailHash',
        isStaff: '$isStaff',
        tournaments: {
          $size: '$tournaments'
        }
      }
    }, {
      $match: {
        tournaments: {
          $gt: 4
        }
      }
    }, {
      $sort: {
        handle: 1
      }
    }, {
      $limit
    }])
    .then(success(res))
    .catch(next)
}

export const show = ({ params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then((player) => player ? player.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then((player) => player ? Object.assign(player, body).save() : null)
    .then((player) => player ? player.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then((player) => player ? player.remove() : null)
    .then(player => new Promise((resolve, reject) => {
      const proms = []

      // remove results with player
      proms.push(new Promise((resolve, reject) => {
        Result
          .remove({
            _playerId: ObjectId(params.id)
          })
          .then(resolve)
          .catch(reject)
      }))

      // remove matches with player
      proms.push(new Promise((resolve, reject) => {
        Match
          .remove({
            $or: [{
              _player1Id: ObjectId(params.id)
            }, {
              _player2Id: ObjectId(params.id)
            }]
          })
          .then(resolve)
          .then(reject)
      }))

      // remove from tournaments array
      proms.push(new Promise(async (resolve, reject) => {
        Tournament
          .update(
            {},
            { $pull: { players: { $in: [ObjectId(params.id)] } } },
            { multi: true }
          )
          .then(resolve)
          .catch(reject)
      }))

      Promise
        .all(proms)
        .then(() => resolve(player))
        .catch(reject)
    }))
    .then(success(res, 204))
    .catch(next)
