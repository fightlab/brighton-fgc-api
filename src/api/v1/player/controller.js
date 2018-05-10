import moment from 'moment-timezone'
import { Types } from 'mongoose'
import _, { merge } from 'lodash'

import { success, notFound, badImplementation, badRequest } from '../../../services/response/'
import Player from '.'
import Result from '../result'
import Match from '../match'
import Tournament from '../tournament'

const ObjectId = Types.ObjectId

export const create = ({ bodymen: { body } }, res, next) =>
  Player.create(body)
    .then(player => player.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))

export const index = (req, res, next) => Player.find({})
  .then(players => players.map(player => player.view(true)))
  .then(success(res))
  .catch(badImplementation(res))

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
    .catch(badImplementation(res))
}

export const show = ({ params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then(player => player ? player.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const update = ({ bodymen: { body }, params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then(player => player ? merge(player, body).save() : null)
    .then(player => player ? player.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

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
    .catch(badImplementation(res))

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

export const me = ({ emailHash }, res, next) => {
  if (!emailHash) return badRequest(res)('No Email Found')

  return Player.findOne({ emailHash })
    .then(notFound(res, 'No Player found for this Email'))
    .then(player => player && player.view(true))
    .then(success(res))
    .catch(badImplementation(res))
}

export const meUpdate = ({ bodymen: { body }, emailHash }, res, next) => {
  Player.findOne({ emailHash })
    .then(notFound(res))
    .then(player => player ? merge(player, body).save() : null)
    .then(player => player ? player.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))
}

export const headToHead = async ({ params }, res, next) => {
  // player holders
  let player1
  let player2

  // get player1
  try {
    player1 = await Player.findById(params.player1)
      .then(notFound(res, 'No Player found for this Email'))
      .then(player => player && player.view())
  } catch (error) {
    return badImplementation(res)(error)
  }

  // get player2
  try {
    player2 = await Player.findById(params.player2)
      .then(notFound(res, 'No Player found for this Email'))
      .then(player => player && player.view())
  } catch (error) {
    return badImplementation(res)(error)
  }

  // get matches
  let matches = []

  try {
    matches = await Match
      .aggregate([{
        $match: {
          $or: [{
            '_player1Id': ObjectId(player1.id),
            '_player2Id': ObjectId(player2.id)
          }, {
            '_player1Id': ObjectId(player2.id),
            '_player2Id': ObjectId(player1.id)
          }]
        }
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
            name: '$game.name',
            imageUrl: '$game.imageUrl'
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
  } catch (error) {
    return badImplementation(res)(error)
  }

  // return early if no matches
  if (!matches.length) return notFound(res, 'No matches found')()

  // get tournaments
  const tournamentIds = _(matches).map(m => m.tournament._id).uniqBy(_.toString).value()
  let tournaments = []
  try {
    tournaments = await Tournament
      .aggregate([{
        $match: {
          _id: {
            $in: tournamentIds
          }
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
  } catch (error) {
    return badImplementation(res)(error)
  }
  // add matches to tournaments
  tournaments = _(tournaments).map(t => _.merge({}, t, { matches: _(matches).filter(m => m.tournament._id.toString() === t._id.toString()) })).orderBy([t => moment(t.dateStart).unix()], ['desc']).value()

  // game matches
  const games = _(matches).groupBy(m => m.game._id.toString()).map(g => ({ _id: g[0].game._id, name: g[0].game.name, imageUrl: g[0].game.imageUrl, matches: g })).orderBy(['name'], ['asc']).value()

  // statistics time
  const statistics = {}
  statistics.matches = _(matches)
    .groupBy('game._id')
    .mapValues(game => ({
      player1wins: _(game).sumBy(match => match._winnerId.toString() === player1.id.toString() ? 1 : 0),
      player2wins: _(game).sumBy(match => match._winnerId.toString() === player2.id.toString() ? 1 : 0),
      total: game.length
    }))
    .value() || {}
  statistics.matches.total = {
    player1wins: _(matches).sumBy(match => match._winnerId.toString() === player1.id.toString() ? 1 : 0),
    player2wins: _(matches).sumBy(match => match._winnerId.toString() === player2.id.toString() ? 1 : 0),
    total: matches.length
  }

  statistics.games = _(matches)
    .groupBy('game._id')
    .mapValues(game => ({
      player1wins: _(game).sumBy(match => match._player1Id.toString() === player1.id.toString() ? _(match.score).sumBy(score => Number(score.p1)) : _(match.score).sumBy(score => Number(score.p2))),
      player2wins: _(game).sumBy(match => match._player1Id.toString() === player2.id.toString() ? _(match.score).sumBy(score => Number(score.p1)) : _(match.score).sumBy(score => Number(score.p2))),
      total: _(game).sumBy(match => _(match.score).sumBy(score => Number(score.p1) + Number(score.p2)))
    }))
    .value() || {}

  statistics.games.total = {
    player1wins: _(matches).sumBy(match => match._player1Id.toString() === player1.id.toString() ? _(match.score).sumBy(score => Number(score.p1)) : _(match.score).sumBy(score => Number(score.p2))),
    player2wins: _(matches).sumBy(match => match._player1Id.toString() === player2.id.toString() ? _(match.score).sumBy(score => Number(score.p1)) : _(match.score).sumBy(score => Number(score.p2))),
    total: _(matches).sumBy(match => _(match.score).sumBy(score => Number(score.p1) + Number(score.p2)))
  }

  return success(res)({ player1, player2, statistics, tournaments, games })
}

export const headToHeadOpponents = async ({ params, query }, res, next) => {
  let player2s
  let player1s

  try {
    player2s = await Match.find({ _player1Id: ObjectId(params.id) }).then(matches => matches.map(match => match._player2Id))
    player1s = await Match.find({ _player2Id: ObjectId(params.id) }).then(matches => matches.map(match => match._player1Id))
  } catch (error) {
    return badImplementation(res)(error)
  }

  const playerIds = _([...player2s, ...player1s]).uniqBy(p => p.toString()).value()

  let players = []
  try {
    const q = { _id: { $in: playerIds }, challongeUsername: { $exists: true } }
    if (query.all) {
      delete q.challongeUsername
    }
    players = await Player.find(q).select('_id handle')
  } catch (error) {
    return badImplementation(res)(error)
  }

  return success(res)(_(players).orderBy([p => _.toLower(p.handle)], ['asc']).value())
}
