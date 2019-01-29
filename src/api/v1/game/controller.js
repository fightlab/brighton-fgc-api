import { Types } from 'mongoose'
import _ from 'lodash'
import asyncNode from 'async'

import { success, notFound, badImplementation, badRequest } from '../../../services/response/'
import Game from '.'
import Tournament from '../tournament'
import Elo from '../elo'
import Match from '../match'
import Player from '../player'
import EloClass from '../../../services/elo'
import Result from '../result'

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

export const elo = async ({ params: { id } }, res, next) => {
  try {
    ObjectId(id)
  } catch (e) {
    return badRequest(res)('Bad ID Parameter')
  }

  try {
    return await Elo
      .find({ game: ObjectId(id), matches: { $gte: 10 } })
      .populate({ path: 'player', select: 'id handle imageUrl emailHash' })
      .sort({ elo: -1 })
      .then(notFound(res))
      .then(success(res))
  } catch (error) {
    return badRequest(res)(error)
  }
}

export const recalculateElo = async ({ params: { id } }, res) => {
  try {
    ObjectId(id)
  } catch (error) {
    return badRequest(res)('Bad ID Parameter')
  }

  try {
    const game = await Game.findById(id)
    if (!game) {
      return notFound(res)()
    }
    // get tournaments
    const tournaments = await Tournament
      .find({ _gameId: ObjectId(id) })
      .select('id')

    const matches = await Match
      .find({ _tournamentId: tournaments.map(t => t.id) })
      .select('-challongeMatchObj')
      .sort('endDate')

    const pIds = _([
      ..._(matches)
        .map(match => match._player1Id)
        .value(),
      ..._(matches)
        .map(match => match._player2Id)
        .value()
    ])
      .uniqBy(id => id.toString())
      .value()

    const players = await Player
      .find({
        _id: {
          $in: pIds
        }
      })
      .select('_id')

    // remove all elo for a game
    await Elo.remove({
      game: ObjectId(id)
    })

    // create elos for every player
    const elos = []
    players.forEach(player => {
      elos.push(new Elo({ player: player._id, game: ObjectId(id) }))
    })

    // calculate elos
    await new Promise((resolve, reject) => {
      asyncNode.eachSeries(matches, async (match, callback) => {
        const p1id = match._player1Id.toString()
        const p2id = match._player2Id.toString()
        const p1 = _.find(elos, e => e.player.toString() === p1id)
        const p2 = _.find(elos, e => e.player.toString() === p2id)

        if (!p1 || !p2) return callback()

        const p1elo = new EloClass({ elo: p1.elo, matches: p1.matches })
        const p2elo = new EloClass({ elo: p2.elo, matches: p2.matches })

        match._player1EloBefore = p1elo.getElo()
        match._player2EloBefore = p2elo.getElo()

        const p1odds = EloClass.expectedScore(p1elo.getElo(), p2elo.getElo())
        const p2odds = EloClass.expectedScore(p2elo.getElo(), p1elo.getElo())

        p1elo.setElo(p1odds, EloClass.eloScore(match.score))
        p2elo.setElo(p2odds, 1 - EloClass.eloScore(match.score))

        const p1i = _.findIndex(elos, e => e.player.toString() === p1id)
        const p2i = _.findIndex(elos, e => e.player.toString() === p2id)

        match._player1EloAfter = p1elo.getElo()
        match._player2EloAfter = p2elo.getElo()
        match._player1MatchesBefore = elos[p1i].matches
        match._player2MatchesBefore = elos[p2i].matches

        elos[p1i].elo = p1elo.getElo()
        elos[p2i].elo = p2elo.getElo()
        elos[p1i].matches++
        elos[p2i].matches++

        await match.save()
        return callback()
      }, err => {
        if (err) return reject(err)
        return resolve()
      })
    })

    // save elos
    await new Promise((resolve, reject) => {
      asyncNode.eachLimit(elos, 5, async (elo, callback) => {
        await elo.save()
        return callback()
      }, err => {
        if (err) return reject(err)
        return resolve()
      })
    })

    // update standings
    await new Promise((resolve, reject) => {
      asyncNode.eachLimit(tournaments, 5, async (tournament, callback) => {
        const results = await Result
          .find({
            _tournamentId: tournament._id
          })
          .select('-meta')

        asyncNode.eachLimit(results, 5, async (result, callback) => {
          const matches = await Match
            .find({
              _tournamentId: tournament._id,
              $or: [{
                _player1Id: result._playerId
              }, {
                _player2Id: result._playerId
              }]
            })
            .sort('startDate')

          if (matches.length) {
            const startMatch = _.head(matches)
            const endMatch = _.last(matches)
            if (startMatch._player1Id.toString() === result._playerId.toString()) {
              result.eloBefore = startMatch._player1EloBefore
            } else {
              result.eloBefore = startMatch._player2EloBefore
            }

            if (endMatch._player1Id.toString() === result._playerId.toString()) {
              result.eloAfter = endMatch._player1EloAfter
            } else {
              result.eloAfter = endMatch._player2EloAfter
            }
            await result.save()
          }

          return callback()
        }, err => {
          if (err) return callback(err)
          return callback()
        })
      }, err => {
        if (err) return reject(err)
        return resolve()
      })
    })

    return success(res)({})
  } catch (error) {
    return badImplementation(res)(error)
  }
}
