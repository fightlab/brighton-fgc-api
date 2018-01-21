import axios from 'axios'
import { URL } from 'url'
import asyncNode from 'async'
import { Types } from 'mongoose'
import moment from 'moment-timezone'
import _, { map, find } from 'lodash'
import { challongeApiKey } from '../../config'
import { success, notFound } from '../../services/response/'
import { Tournament } from '.'
import { Match } from '../match'
import { Player } from '../player'
import { Game } from '../game'
import { Result } from '../result'

const ObjectId = Types.ObjectId

const getPlayers = tournament => new Promise((resolve, reject) => {
  const queue = map(tournament.meta.participants, p => async callback => {
    const participant = p.participant

    let player

    if (participant.challonge_username) {
      player = await Player
        .findOne({
          challongeUsername: new RegExp(`^${participant.challonge_username}$`, 'i')
        })
        .catch(callback)
    } else {
      player = await Player
        .findOne({
          challongeName: new RegExp(`^${participant.display_name}$`, 'i')
        })
        .catch(callback)
    }

    if (player) {
      if (player.challongeName.indexOf(participant.display_name) === -1) {
        player.challongeName.push(participant.display_name)
        player.markModified('challongeName')
        await player.save().catch(callback)
      }

      return callback(null, { player, id: participant.id, meta: participant })
    } else {
      const body = {}
      if (participant.challonge_username) {
        body.challongeUsername = participant.challonge_username
        body.handle = participant.challonge_username
        body.emailHash = participant.email_hash
        body.challongeName = [participant.challonge_username]
      } else {
        body.handle = participant.display_name
        body.challongeName = [participant.display_name]
      }

      const np = new Player(body)
      await np.save().catch(callback)
      return callback(null, { player: np, id: participant.id, meta: participant })
    }
  })

  asyncNode.series(queue, (err, players) => {
    if (err) return reject(err)
    return resolve(players)
  })
})

const getMatches = (tournament, players) => new Promise((resolve, reject) => {
  const queue = map(tournament.meta.matches, m => async callback => {
    const match = m.match
    const nm = new Match({
      _tournamentId: tournament._id,
      _player1Id: find(players, p => p.id === match.player1_id).player._id,
      _player2Id: find(players, p => p.id === match.player2_id).player._id,
      _winnerId: find(players, p => p.id === match.winner_id).player._id,
      _loserId: find(players, p => p.id === match.loser_id).player._id,
      score: getScore(match.scores_csv),
      round: m.round,
      challongeMatchObj: m
    })
    await nm.save().catch(callback)
    return callback(null, nm)
  })

  asyncNode.series(queue, (err, matches) => {
    if (err) return reject(err)
    return resolve(matches)
  })
})

const getResults = (tournament, players) => new Promise((resolve, reject) => {
  const queue = map(players, p => async callback => {
    const nr = new Result({
      _tournamentId: tournament._id,
      _playerId: p.player._id,
      rank: p.meta.final_rank
    })
    await nr.save().catch(callback)
    return callback(null, nr)
  })

  asyncNode.series(queue, (err, results) => {
    if (err) return reject(err)
    return resolve(results)
  })
})

const getScore = scores => {
  return _
    .chain(scores)
    .split(',')
    .map(s => {
      const score = s.split('-')
      return {
        p1: score[0],
        p2: score[1]
      }
    })
    .value()
}

export const create = ({ bodymen: { body } }, res, next) =>
  Tournament.create(body)
    .then(tournament => tournament.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ query }, res, next) =>
  Tournament.find(query)
    .populate({
      path: '_gameId',
      select: 'name id'
    })
    .then(tournaments => tournaments.map(tournament => tournament.view()))
    .then(success(res))
    .catch(next)

export const indexNoGame = ({ query }, res, next) =>
  Tournament.find(query)
    .then(tournaments => tournaments.map(tournament => tournament.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Tournament.findById(params.id)
    .populate({
      path: '_gameId',
      select: 'name id'
    })
    .populate({
      path: 'event',
      select: 'name id'
    })
    .populate({
      path: 'series',
      select: 'name id'
    })
    .populate({
      path: 'players',
      select: '-challongeName'
    })
    .then(notFound(res))
    .then(tournament => tournament ? tournament.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Tournament.findById(params.id)
    .then(notFound(res))
    .then(tournament => tournament ? Object.assign(tournament, body).save() : null)
    .then(tournament => tournament ? tournament.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Tournament
    .findById(params.id)
    .then(notFound(res))
    .then(tournament => tournament ? tournament.remove() : null)
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

export const challongeUpdate = async ({ bodymen: { body }, params }, res, next) => {
  const API_URL = `https://api.challonge.com/v1`

  if (process.env.NODE_ENV === 'test') {
    return success(res, 201)(body)
  }

  if (!body.bracket) {
    return notFound(res)
  }

  const bracket = new URL(body.bracket)

  const subdomain = bracket.hostname.split('.')[0]
  const path = bracket.pathname.replace('/', '')
  const url = `${API_URL}/tournaments/${subdomain === 'challonge' ? '' : `${subdomain}-`}${path}.json?include_participants=1&include_matches=1&api_key=${challongeApiKey}`

  const response = await axios(url)

  const tournament = response.data

  const query = {}
  if (body._gameId) {
    query._id = ObjectId(body._gameId)
  } else {
    query.name = tournament.tournament.game_name
  }

  const game = await Game.findOne(query).exec(next)

  if (!game) {
    return notFound(res)
  }

  const updated = {
    name: tournament.tournament.name,
    type: tournament.tournament.tournament_type,
    _gameId: game._id || null,
    dateStart: moment(tournament.tournament.started_at || tournament.tournament.start_at || null).toDate(),
    dateEnd: tournament.tournament.completed_at && moment(tournament.tournament.completed_at).toDate(),
    bracket: tournament.tournament.full_challonge_url,
    bracketImage: tournament.tournament.live_image_url,
    signUpUrl: tournament.tournament.sign_up_url,
    challongeId: tournament.tournament.id,
    meta: tournament.tournament
  }

  if (!updated.dateEnd) {
    delete updated.dateEnd
  }

  let dbTournament = await Tournament.findById(params.id).catch(next)
  dbTournament = await notFound(res)(dbTournament)
  dbTournament = dbTournament ? await Object.assign(dbTournament, updated).save().catch(next) : null
  dbTournament = dbTournament ? dbTournament.view(true) : null
  if (dbTournament) {
    // remove matches and results so they can me updated
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

    await Promise
      .all(proms)
      .catch(next)

    const players = await getPlayers(dbTournament).catch(next)
    dbTournament = await Tournament
      .findByIdAndUpdate(params.id, {
        $set: {
          players: _.map(players, p => p.player._id)
        }
      })
      .catch(next)

    await getMatches(dbTournament, players).catch(next)
    await getResults(dbTournament, players).catch(next)

    return success(res)(dbTournament)
  }
}
