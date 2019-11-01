import axios from 'axios'
import { URL } from 'url'
import asyncNode from 'async'
import cloudinary from 'cloudinary'
import _, { map, find } from 'lodash'
import { Types } from 'mongoose'
import config from '../../../config'
import moment from 'moment-timezone'
import { success, notFound, badImplementation, badRequest } from '../../../services/response/'
import Tournament from '.'
import Result from '../result'
import Match from '../match'
import Game from '../game'
import Player from '../player'
import Elo from '../elo'
import EloClass from '../../../services/elo'

const ObjectId = Types.ObjectId

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const getPlayers = tournament => new Promise((resolve, reject) => {
  const queue = map(tournament.meta.participants, p => async callback => {
    const participant = p.participant

    let player

    if (participant.email_hash) {
      try {
        player = await Player
          .findOne({
            emailHash: new RegExp(`^${participant.email_hash}$`, 'i')
          })
      } catch (error) {
        console.error(error)
        return callback(error)
      }
    } else {
      try {
        player = await Player
          .findOne({
            challongeName: new RegExp(`^${participant.display_name}$`, 'i')
          })
      } catch (error) {
        console.error(error)
        return callback(error)
      }
    }

    if (player) {
      if (participant.challonge_username && player.handle !== participant.challonge_username) {
        player.handle = participant.challonge_username
        player.markModified('handle')
      }

      if (player.challongeName.indexOf(participant.display_name) === -1) {
        player.challongeName.push(participant.display_name)
        player.markModified('challongeName')
      }

      if (player.emailHash !== participant.email_hash) {
        player.emailHash = participant.email_hash
        player.markModified('emailHash')
      }

      if (participant.attached_participatable_portrait_url && player.challongeImageUrl !== participant.attached_participatable_portrait_url) {
        let url
        if (participant.attached_participatable_portrait_url.startsWith('//')) {
          url = `https:${participant.attached_participatable_portrait_url}`
        } else {
          url = participant.attached_participatable_portrait_url
        }

        const result = await new Promise(resolve => cloudinary.uploader.upload(url, resolve))
        if (result.secure_url) {
          player.imageUrl = result.secure_url
          player.challongeImageUrl = participant.attached_participatable_portrait_url
          player.markModified('imageUrl')
          player.markModified('challongeImageUrl')
        }
      }
      try {
        await player.save()
        return callback(null, { player, id: participant.id, meta: participant })
      } catch (error) {
        console.error(error)
        return callback(error)
      }
    } else {
      const body = {}
      if (participant.email_hash) {
        if (participant.attached_participatable_portrait_url) {
          body.challongeImageUrl = participant.attached_participatable_portrait_url

          let url
          if (participant.attached_participatable_portrait_url.startsWith('//')) {
            url = `https:${participant.attached_participatable_portrait_url}`
          } else {
            url = participant.attached_participatable_portrait_url
          }

          const result = await new Promise(resolve => cloudinary.uploader.upload(url, resolve))
          if (result.secure_url) {
            body.imageUrl = result.secure_url
          }
        }

        body.challongeUsername = participant.challonge_username
        body.handle = participant.challonge_username
        body.emailHash = participant.email_hash
        body.challongeName = [participant.challonge_username]
      } else {
        body.handle = participant.display_name
        body.challongeName = [participant.display_name]
      }

      const np = new Player(body)
      try {
        await np.save()
        return callback(null, { player: np, id: participant.id, meta: participant })
      } catch (error) {
        console.error(error)
        return callback(error)
      }
    }
  })

  asyncNode.parallelLimit(queue, 5, (err, players) => {
    if (err) return reject(err)
    return resolve(players)
  })
})

const getRounds = (matches, type) => {
  const rounds = _(matches).map(m => m.match.round).uniq().orderBy().value()
  const roundsMap = new Map()
  switch (type) {
    case 'double elimination':
      const winners = _(rounds).filter(n => n > 0).orderBy().reverse().value()
      _.each(winners, (round, index) => {
        switch (index) {
          case 0:
            roundsMap.set(round, 'Grand Final')
            break
          case 1:
            roundsMap.set(round, 'Winners Final')
            break
          case 2:
            roundsMap.set(round, 'Winners Semi-Final')
            break
          default:
            roundsMap.set(round, `Round ${round}`)
            break
        }
      })

      const losers = _(rounds).filter(n => n < 0).orderBy().value()
      _.each(losers, (round, index) => {
        switch (index) {
          case 0:
            roundsMap.set(round, 'Losers Final')
            break
          case 1:
            roundsMap.set(round, 'Losers Semi-Final')
            break
          default:
            roundsMap.set(round, `Losers Round ${Math.abs(round)}`)
            break
        }
      })
      break
    case 'single elimination':
      _.each(_(rounds).orderBy().reverse().value(), (round, index) => {
        switch (index) {
          case 0:
            roundsMap.set(round, 'Final')
            break
          case 1:
            roundsMap.set(round, 'Semi-Final')
            break
          default:
            roundsMap.set(round, `Round ${round}`)
            break
        }
      })
      break
    default:
      _.each(rounds, round => {
        roundsMap.set(round, `Round ${round}`)
      })
      break
  }
  return roundsMap
}

const getMatches = (tournament, players) => new Promise((resolve, reject) => {
  const roundsMap = getRounds(tournament.meta.matches, tournament.meta.tournament_type)

  const queue = map(tournament.meta.matches, m => async callback => {
    const match = m.match
    const matchObj = {
      _tournamentId: tournament._id,
      _player1Id: find(players, p => p.id === match.player1_id).player._id,
      _player2Id: find(players, p => p.id === match.player2_id).player._id,
      _winnerId: find(players, p => p.id === match.winner_id).player._id,
      _loserId: find(players, p => p.id === match.loser_id).player._id,
      score: getScore(match.scores_csv),
      round: match.round,
      roundName: roundsMap.get(match.round),
      endDate: match.round,
      challongeMatchObj: match
    }
    if (match.started_at) {
      matchObj.startDate = moment(match.started_at).toDate()
    }
    if (match.completed_at) {
      matchObj.endDate = moment(match.completed_at).toDate()
    }
    const nm = new Match(matchObj)
    try {
      await nm.save()
      return callback(null, nm)
    } catch (err) {
      console.error(err)
      return callback(err)
    }
  })

  asyncNode.parallelLimit(queue, 5, (err, matches) => {
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
    try {
      await nr.save()
      return callback(null, nr)
    } catch (error) {
      console.error(error)
      return callback(error)
    }
  })

  asyncNode.parallelLimit(queue, 5, (err, results) => {
    if (err) return reject(err)
    return resolve(results)
  })
})

const updateElo = (tournament, game) => new Promise(async (resolve, reject) => {
  try {
    const matches = await Match
      .find({ _tournamentId: tournament._id })
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

    const elos = []

    await new Promise((resolve, reject) => {
      asyncNode.eachLimit(players, 5, async (player, callback) => {
        const elo = await Elo.findOne({
          player: player._id,
          game
        })

        if (elo) elos.push(elo)
        else elos.push(new Elo({ player: player._id, game }))

        return callback()
      }, err => {
        if (err) return reject(err)
        return resolve()
      })
    })

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
    await new Promise(async (resolve, reject) => {
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
        return callback()
      }, err => {
        if (err) return reject(err)
        return resolve()
      })
    })

    return resolve(true)
  } catch (error) {
    return reject(error)
  }
})

const getScore = scores => {
  return _
    .chain(scores)
    .split(',')
    .map(s => {
      const score = s.split('-')
      let p1 = 0
      let p2 = 0
      switch (score.length) {
        case 2:
          p1 = parseInt(score[0]) || 0
          p2 = parseInt(score[1]) || 0
          break
        case 3:
          if (score[0] === '') {
            p1 = 0
            p2 = parseInt(score[2]) || 0
          } else if (score[1] === '') {
            p1 = parseInt(score[0]) || 0
            p2 = 0
          }
          break
        default:
          break
      }
      return {
        p1,
        p2
      }
    })
    .value()
}

export const create = ({ bodymen: { body } }, res) =>
  Tournament.create(body)
    .then(tournament => tournament.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))

export const index = ({ query }, res) => {
  const cursor = {
    sort: {
      dateStart: -1
    }
  }
  if (query.limit) {
    cursor.limit = parseInt(query.limit)
  }
  Tournament.find({}, {}, cursor)
    .populate({
      path: '_gameId',
      select: 'name id'
    })
    .then(tournaments => tournaments.map(tournament => tournament.view()))
    .then(success(res))
    .catch(badImplementation(res))
}

export const indexNoGame = ({ query }, res) =>
  Tournament.find(query)
    .then(tournaments => tournaments.map(tournament => tournament.view()))
    .then(success(res))
    .catch(badImplementation(res))

export const show = ({ params }, res) =>
  Tournament.findById(params.id)
    .populate({
      path: '_gameId'
    })
    .populate({
      path: 'event'
    })
    .populate({
      path: 'series'
    })
    .populate({
      path: 'players',
      select: '-challongeName'
    })
    .then(notFound(res))
    .then(tournament => tournament ? tournament.view() : null)
    .then(success(res))
    .catch(badImplementation(res))

export const update = ({ bodymen: { body }, params }, res) =>
  Tournament.findById(params.id)
    .then(notFound(res))
    .then(tournament => tournament ? Object.assign(tournament, body).save() : null)
    .then(tournament => tournament ? tournament.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const destroy = ({ params }, res) =>
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
    .catch(badImplementation(res))

export const getStandings = async ({ params }, res) => {
  try {
    ObjectId(params.id)
  } catch (e) {
    return badRequest(res)('Bad ID Parameter')
  }

  const tournament = await Tournament.findById(params.id)

  if (!tournament) {
    return notFound(res)()
  }

  Result
    .find({
      _tournamentId: ObjectId(params.id)
    }, {}, {
      sort: {
        rank: 1
      }
    })
    .populate({
      path: '_playerId',
      select: 'id handle emailHash imageUrl'
    })
    .then(success(res))
    .catch(badImplementation(res))
}

export const challongeUpdate = async ({ bodymen: { body }, params }, res) => {
  const API_URL = `https://api.challonge.com/v1`

  if (!body.bracket) {
    return res.sendStatus(404)
  }

  const bracket = new URL(body.bracket)

  const subdomain = bracket.hostname.split('.')[0]
  const path = bracket.pathname.replace('/', '')
  const url = `${API_URL}/tournaments/${subdomain === 'challonge' ? '' : `${subdomain}-`}${path}.json?include_participants=1&include_matches=1&api_key=${config.challongeApiKey}`

  let response

  try {
    response = await axios(url)
  } catch (error) {
    return badImplementation(res)(error)
  }

  const tournament = response.data

  const query = {}
  if (body._gameId) {
    query._id = ObjectId(body._gameId)
  } else {
    query.name = tournament.tournament.game_name
  }

  let game

  try {
    game = await Game.findOne(query)
  } catch (error) {
    return badImplementation(res)(error)
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

  let dbTournament
  try {
    dbTournament = await Tournament.findById(params.id)
    if (!dbTournament) {
      return res.sendStatus(404)
    }
    dbTournament = dbTournament ? await Object.assign(dbTournament, updated).save() : null
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

      const players = await getPlayers(dbTournament)
      dbTournament = await Tournament
        .findByIdAndUpdate(params.id, {
          $set: {
            players: _.map(players, p => p.player._id)
          }
        })

      await getMatches(dbTournament, players)
      await getResults(dbTournament, players)
      tournament.tournament.state === 'complete' && await updateElo(dbTournament, game._id)

      return success(res)(dbTournament)
    }
  } catch (error) {
    return badImplementation(res)(error)
  }
}

export const count = (req, res) =>
  Tournament
    .count()
    .then(success(res))
    .catch(badImplementation(res))

export const matches = async ({ params }, res) => {
  try {
    ObjectId(params.id)
  } catch (e) {
    return badRequest(res)('Bad ID Parameter')
  }

  const tournament = await Tournament.findById(params.id)

  if (!tournament) {
    return notFound(res)()
  }

  Match
    .find({ _tournamentId: ObjectId(params.id) })
    .select('-challongeMatchObj')
    .populate({
      path: '_player1Id',
      select: '_id handle imageUrl'
    })
    .populate({
      path: '_player2Id',
      select: '_id handle imageUrl'
    })
    .populate({
      path: '_winnerId',
      select: '_id handle imageUrl'
    })
    .populate({
      path: '_loserId',
      select: '_id handle imageUrl'
    })
    .then(success(res))
    .catch(badImplementation(res))
}

export const googleSheetsMatches = async ({ params: { tournamentId } }, res) => {
  try {
    ObjectId(tournamentId)
  } catch (e) {
    return badRequest(res)('Bad ID Parameter')
  }

  try {
    const tournament = await Tournament
      .findById(tournamentId)

    if (!tournament) {
      return notFound(res)()
    }

    const matches = await Match
      .find({ _tournamentId: ObjectId(tournamentId) })
      .populate({
        path: '_winnerId',
        select: 'handle'
      })
      .populate({
        path: '_loserId',
        select: 'handle'
      })

    return success(res)(matches.map(m => ({
      _id: m._id,
      endDate: m.endDate,
      tournament: tournament.name,
      roundName: m.roundName,
      winner: m._winnerId.handle,
      loser: m._loserId.handle,
      score: m.challongeMatchObj.scores_csv,
      youtube: tournament.youtube
    })))
  } catch (error) {
    return badImplementation(res)(error)
  }
}
