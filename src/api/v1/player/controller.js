import { Types } from 'mongoose'
import _ from 'lodash'

import { success, notFound, badImplementation } from '../../../services/response/'
import Player from '.'
import Result from '../result'
import Match from '../match'
import Tournament from '../tournament'

const ObjectId = Types.ObjectId

export const create = ({ bodymen: { body } }, res, next) =>
  Player.create(body)
    .then(player => player.view(true))
    .then(success(res, 201))
    .catch(badImplementation)

export const index = (req, res, next) => Player.find({})
  .then(players => players.map(player => player.view(true)))
  .then(success(res))
  .catch(badImplementation)

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
        imageUrl: '$imageUrl',
        isStaff: '$isStaff',
        tournaments: {
          $size: '$tournaments'
        },
        profile: '$profile'
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
    .catch(badImplementation)
}

export const show = ({ params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then(player => player ? player.view(true) : null)
    .then(success(res))
    .catch(badImplementation)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then(player => player ? Object.assign(player, body).save() : null)
    .then(player => player ? player.view(true) : null)
    .then(success(res))
    .catch(badImplementation)

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
    .catch(badImplementation)

export const stats = async ({ params }, res, next) => {
  try {
    const tournaments = await Tournament
      .aggregate([{
        $match: {
          players: Types.ObjectId(params.id)
        }
      }, {
        $lookup: {
          from: 'games',
          localField: '_gameId',
          foreignField: '_id',
          as: 'game'
        }
      }, {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event'
        }
      }, {
        $unwind: '$game'
      }, {
        $unwind: '$event'
      }, {
        $project: {
          _id: '$_id',
          name: '$name',
          type: '$type',
          game: {
            _id: '$game._id',
            name: '$game.name',
            imageUrl: '$game.imageUrl'
          },
          event: {
            _id: '$event._id',
            name: '$event.name',
            date: '$event.date'
          },
          dateStart: '$dateStart'
        }
      }])

    const games = _(tournaments).map(t => ({ name: t.game.name, _id: t.game._id.toString(), imageUrl: t.game.imageUrl })).uniqBy('_id').orderBy(['name'], ['asc']).value()

    let matchAgg = await Match
      .aggregate([{
        $match: { $or: [ { _player1Id: Types.ObjectId(params.id) }, { _player2Id: Types.ObjectId(params.id) } ] }
      }, {
        $lookup: {
          from: 'tournaments',
          localField: '_tournamentId',
          foreignField: '_id',
          as: 'tournament'
        }
      }, {
        $unwind: '$tournament'
      }, {
        $lookup: {
          from: 'games',
          localField: 'tournament._gameId',
          foreignField: '_id',
          as: 'game'
        }
      }, {
        $unwind: '$game'
      }, {
        $project: {
          tournament: {
            _id: '$tournament._id',
            name: '$tournament.name'
          },
          game: {
            _id: '$game._id',
            name: '$game.name'
          },
          _player1Id: '$_player1Id',
          _player2Id: '$_player2Id',
          _winnerId: '$_winnerId',
          _loserId: '$_loserId',
          score: '$score',
          startDate: '$startDate',
          endDate: '$endDate'
        }
      }])

    const matches = _(matchAgg)
      .groupBy('game._id')
      .mapValues(game => ({
        w: _(game)
          .sumBy(match => match._winnerId.toString() === params.id ? 1 : 0),
        l: _(game)
          .sumBy(match => match._loserId.toString() === params.id ? 1 : 0),
        t: game.length
      }))
      .value() || {}

    matches.total = {
      w: _(matchAgg)
        .sumBy(match => match._winnerId.toString() === params.id ? 1 : 0),
      l: _(matchAgg)
        .sumBy(match => match._loserId.toString() === params.id ? 1 : 0),
      t: matchAgg.length
    }

    const rounds = _(matchAgg)
      .groupBy('game._id')
      .mapValues(game => ({
        w: _(game).sumBy(match => match._player1Id.toString() === params.id ? _(match.score).sumBy(score => Number(score.p1)) : _(match.score).sumBy(score => Number(score.p2))),
        l: _(game).sumBy(match => match._player1Id.toString() === params.id ? _(match.score).sumBy(score => Number(score.p2)) : _(match.score).sumBy(score => Number(score.p1))),
        t: _(game).sumBy(match => _(match.score).sumBy(score => Number(score.p1) + Number(score.p2)))
      }))
      .value() || {}

    rounds.total = {
      w: _(matchAgg).sumBy(match => match._player1Id.toString() === params.id ? _(match.score).sumBy(score => Number(score.p1)) : _(match.score).sumBy(score => Number(score.p2))),
      l: _(matchAgg).sumBy(match => match._player1Id.toString() === params.id ? _(match.score).sumBy(score => Number(score.p2)) : _(match.score).sumBy(score => Number(score.p1))),
      t: _(matchAgg).sumBy(match => _(match.score).sumBy(score => Number(score.p1) + Number(score.p2)))
    }

    return res.status(200).json({ tournaments, games, matches, rounds })
  } catch (error) {
    return next(error)
  }
}
