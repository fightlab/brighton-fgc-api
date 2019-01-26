import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Match, { MatchRouter } from '.'
import { Types } from 'mongoose'
import Player from '../player'
import Tournament from '../tournament'
import Game from '../game'
import Character from '../character'

const app = () => express(apiRoot, MatchRouter)

let match, player1, player2, tournament, game, char

beforeEach(async () => {
  player1 = new Player({ handle: 'Ruler' })
  await player1.save()
  player2 = new Player({ handle: 'Saber' })
  await player2.save()
  game = new Game({ name: 'F/GO', short: 'FGO' })
  await game.save()
  tournament = new Tournament({
    _gameId: game._id
  })
  await tournament.save()
  char = new Character({
    name: `Jeanne d'Arc`,
    short: 'RULER',
    game: game._id
  })
  await char.save()
  const date = new Date()
  match = await Match.create({
    _tournamentId: tournament._id,
    _player1Id: player1._id,
    _player2Id: player2._id,
    _winnerId: player1._id,
    _loserId: player2._id,
    score: [{p1: 2, p2: 1}],
    round: 1,
    challongeMatchObj: 'test',
    startDate: date,
    endDate: date,
    youtubeId: 'test',
    characters: [char._id],
    youtubeTimestamp: '1s',
    youtubeSeconds: 1
  })

  await Match.create({
    _tournamentId: tournament._id,
    _player1Id: player1._id,
    _player2Id: player2._id,
    _winnerId: player1._id,
    _loserId: player2._id,
    score: [{p1: 2, p2: 1}],
    round: 2,
    challongeMatchObj: 'test',
    startDate: date,
    endDate: date
  })
})

test('POST /matches 201 (admin)', async () => {
  const date = new Date().toISOString()
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ _tournamentId: tournament._id.toString(), _player1Id: player1._id.toString(), _player2Id: player2._id.toString(), _winnerId: player2._id.toString(), _loserId: player1._id.toString(), score: 'test', round: 1, challongeMatchObj: 'test', startDate: date, endDate: date, _player1EloBefore: 1, _player1EloAfter: 1, _player2EloBefore: 1, _player2EloAfter: 1, youtubeId: 'test', characters: char._id.toString(), youtubeTimestamp: '2s', youtubeSeconds: 2 })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body._tournamentId).toEqual(tournament._id.toString())
  expect(body._player1Id).toEqual(player1._id.toString())
  expect(body._player2Id).toEqual(player2._id.toString())
  expect(body._winnerId).toEqual(player2._id.toString())
  expect(body._loserId).toEqual(player1._id.toString())
  expect(body.score).toEqual(['test'])
  expect(body.round).toEqual(1)
  expect(body._player1EloBefore).toEqual(1)
  expect(body._player1EloAfter).toEqual(1)
  expect(body._player2EloAfter).toEqual(1)
  expect(body._player2EloBefore).toEqual(1)
  expect(body.challongeMatchObj).toEqual('test')
  expect(body.youtubeId).toEqual('test')
  expect(body.youtubeTimestamp).toEqual('2s')
  expect(body.youtubeSeconds).toEqual(2)
  expect(body.characters).toEqual([char._id.toString()])
  expect(body.startDate).toEqual(date)
  expect(body.endDate).toEqual(date)
})

test('POST /matches 403 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('POST /matches 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /matches 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /matches/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${match.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(match.id)
})

test('GET /matches/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /matches/:id 200 (admin)', async () => {
  const date = new Date().toISOString()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${match.id}?access_token=admin`)
    .send({ _tournamentId: tournament._id.toString(), _player1Id: player1._id.toString(), _player2Id: player2._id.toString(), _winnerId: player2._id.toString(), _loserId: player1._id.toString(), score: 'test', round: 1, challongeMatchObj: 'test', startDate: date, endDate: date, _player1EloBefore: 1, _player1EloAfter: 1, _player2EloBefore: 1, _player2EloAfter: 1, youtubeId: 'test', characters: char._id.toString(), youtubeTimestamp: '2s', youtubeSeconds: 2 })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body._tournamentId).toEqual(tournament._id.toString())
  expect(body._player1Id).toEqual(player1._id.toString())
  expect(body._player2Id).toEqual(player2._id.toString())
  expect(body._winnerId).toEqual(player2._id.toString())
  expect(body._loserId).toEqual(player1._id.toString())
  expect(body.score).toEqual(['test'])
  expect(body.round).toEqual(1)
  expect(body._player1EloBefore).toEqual(1)
  expect(body._player1EloAfter).toEqual(1)
  expect(body._player2EloAfter).toEqual(1)
  expect(body._player2EloBefore).toEqual(1)
  expect(body.challongeMatchObj).toEqual('test')
  expect(body.youtubeId).toEqual('test')
  expect(body.youtubeTimestamp).toEqual('2s')
  expect(body.youtubeSeconds).toEqual(2)
  expect(body.characters).toEqual([char._id.toString()])
  expect(body.startDate).toEqual(date)
  expect(body.endDate).toEqual(date)
})

test('PUT /matches/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${match.id}?access_token=user`)
    .send({ })
  expect(status).toBe(403)
})

test('PUT /matches/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${match.id}`)
  expect(status).toBe(401)
})

test('PUT /matches/:id 404 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const date = new Date().toISOString()
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ _tournamentId: id, _player1Id: id, _player2Id: id, _winnerId: id, _loserId: id, score: 'test', round: 1, challongeMatchObj: 'test', startDate: date, endDate: date })
  expect(status).toBe(404)
})

test('DELETE /matches/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${match.id}?access_token=admin`)
    .query({ })
  expect(status).toBe(204)
})

test('DELETE /matches/:id 403 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${match.id}?access_token=user`)
    .query({ })
  expect(status).toBe(403)
})

test('DELETE /matches/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${match.id}`)
  expect(status).toBe(401)
})

test('DELETE /matches/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456?access_token=admin')
    .query({ })
  expect(status).toBe(404)
})

test('GET /matches/count 200', async () => {
  const { status, body } = await (request(app()))
    .get(`${apiRoot}/count`)
  expect(status).toBe(200)
  expect(body).toBe(2)
})

test('GET /matches/count/games 200', async () => {
  const { status, body } = await (request(app()))
    .get(`${apiRoot}/count/games`)
  expect(status).toBe(200)
  expect(body).toBe(6)
})

test('GET /matches/youtube 200', async () => {
  const { status, body } = await (request(app()))
    .get(`${apiRoot}/youtube`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(Array.isArray(body.tournaments)).toBe(true)
  expect(Array.isArray(body.characters)).toBe(true)
  expect(Array.isArray(body.players)).toBe(true)
  expect(Array.isArray(body.games)).toBe(true)
  expect(Array.isArray(body.matches)).toBe(true)
  expect(body.matches.length).toBe(1)
})

test('PUT /matches/youtube 200', async () => {
  const { status, body } = await (request(app()))
    .put(`${apiRoot}/youtube`)
    .send({
      token: process.env.CHALLONGE_API_KEY,
      _id: match._id.toString(),
      timestamp: '2h31m5s',
      videoId: 'test1',
      characters: 'ruler,saber'
    })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(Array.isArray(body.characters))
  expect(body.characters.length).toBe(2)
  expect(body.youtubeId).toBe('test1')
  expect(body.youtubeTimestamp).toBe('2h31m5s')
  expect(body.youtubeSeconds).toBe(9065)
})

test('PUT /matches/youtube 403', async () => {
  const { status } = await (request(app()))
    .put(`${apiRoot}/youtube`)
    .send({
      token: 'badtoken',
      _id: match._id.toString(),
      timestamp: '2h31m5s',
      videoId: 'test1',
      characters: 'ruler,saber'
    })
  expect(status).toBe(403)
})

test('PUT /matches/youtube 422 - bad timestamp/videoid', async () => {
  const { status, body } = await (request(app()))
    .put(`${apiRoot}/youtube`)
    .send({
      token: process.env.CHALLONGE_API_KEY,
      _id: match._id.toString(),
      characters: 'ruler,saber'
    })

  expect(status).toBe(422)
  expect(body.output.payload.message).toBe('timestamp and videoId required')
})

test('PUT /matches/youtube 422 - bad characters', async () => {
  const { status, body } = await (request(app()))
    .put(`${apiRoot}/youtube`)
    .send({
      token: process.env.CHALLONGE_API_KEY,
      _id: match._id.toString(),
      timestamp: '2h31m5s',
      videoId: 'test1'
    })

  expect(status).toBe(422)
  expect(body.output.payload.message).toBe('characters required')
})
