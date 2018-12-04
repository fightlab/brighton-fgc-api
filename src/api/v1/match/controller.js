
import _ from 'lodash'
import { success, notFound, badImplementation, badData, unauthorized } from '../../../services/response/'
import Match from '.'
import Character from '../character'
import Player from '../player'
import Tournament from '../tournament'
import Game from '../game'

const getYoutubeSeconds = timestamp => {
  return _(timestamp)
    .words()
    .reverse()
    .chunk(2)
    .fromPairs()
    .mapValues(v => _.toNumber(v))
    .reduce((r, v, k) => {
      switch (k.toLowerCase()) {
        case 's':
          return v + r
        case 'm':
          return v * 60 + r
        case 'h':
          return v * 3600 + r
        default:
          return r
      }
    })
}

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
    .then(matches => _(matches).sumBy(match => _(match.score).sumBy(score => parseInt(score.p1 || 0) + parseInt(score.p2 || 0))))
    .then(success(res))
    .catch(next)

export const googleSheetsMatches = async ({ body: { _id, timestamp, videoId, characters = '', token = '' } }, res) => {
  try {
    if (!token || token !== process.env.CHALLONGE_API_KEY) return unauthorized(res)()

    const match = await Match.findById(_id)
    if (!match) return notFound(res)

    const tournament = await Tournament.findById(match._tournamentId)
    if (!tournament) return notFound(res)

    if (!timestamp || !videoId) return badData(res, 'timestamp and videoId required')

    match.youtubeTimestamp = timestamp
    match.youtubeId = videoId
    match.youtubeSeconds = getYoutubeSeconds(timestamp)

    if (!characters) return badData(res, 'characters required')
    characters = _.split(characters, ',')
    const proms = characters.map(c => new Promise(async (resolve, reject) => {
      try {
        let character = await Character.findOne({
          short: _(c).replace(' ', '').toUpperCase(),
          game: tournament._gameId
        })

        if (!character) {
          character = new Character({
            short: _(c).replace(' ', '').toUpperCase(),
            game: tournament._gameId
          })

          await character.save()
        }

        return resolve(character)
      } catch (error) {
        return reject(error)
      }
    }))

    Promise
      .all(proms)
      .then(async characters => {
        match.characters = characters.map(c => c._id)
        match.markModified('characters')
        await match.save()
        return success(res)(match)
      })
  } catch (error) {
    console.log(error)
    return badImplementation(res)(error)
  }
}

export const getMatchesWithYoutube = async (req, res) => {
  try {
    const matches = await Match
      .find({
        youtubeId: {
          $exists: true
        }
      })
      .select('-challongeMatchObj -createdAt -updatedAt -startdate')
      .sort('-endDate')

    const tournaments = await Tournament
      .find({
        _id: {
          $in: _(matches).map(m => m._tournamentId).uniqBy(id => id.toString()).value()
        }
      })
      .select('id name _gameId dateStart')
      .sort({
        dateStart: -1
      })

    const players = await Player
      .find({
        _id: {
          $in: _.uniqBy([..._(matches).map(m => m._player1Id).value(), ..._(matches).map(m => m._player2Id).value()], id => id.toString())
        }
      })
      .select('id handle imageUrl emailHash')
      .sort({
        handle: 1
      })

    const characters = await Character
      .find({
        _id: {
          $in: _(matches).map(match => match.characters).flattenDeep().uniqBy(id => id.toString()).value()
        }
      })
      .sort({
        game: 1,
        short: 1,
        name: 1
      })

    const games = await Game
      .find({
        _id: {
          $in: _(tournaments).map(t => t._gameId).uniqBy(id => id.toString()).value()
        }
      })
      .select('id name imageUrl short')
      .sort({ name: 1 })

    const returnObj = {
      tournaments,
      players,
      characters,
      games,
      matches: _(matches).map(m => ({
        tournament: m._tournamentId,
        date: m.endDate,
        player1: m._player1Id,
        player2: m._player2Id,
        winner: m._winnerId,
        loser: m._loserId,
        round: m.roundName || `${m.round < 0 ? 'Losers' : ''} Round ${Math.abs(m.round)}`,
        score: `${m.score[0].p1} - ${m.score[0].p2}`,
        youtube: m.youtubeId ? `https://www.youtube.com/watch?v=${m.youtubeId}&t=${m.youtubeTimestamp}` : '',
        characters: m.characters
      }))
    }
    return success(res)(returnObj)
  } catch (error) {
    return badImplementation(res)(error)
  }
}
