import _ from 'lodash'
import request from 'supertest'
import { Types } from 'mongoose'
import config from '../../../config'
import express from '../../../services/express'
import Tournament, { TournamentRouter } from '.'
import Game from '../game'
import Event from '../event'
import Series from '../series'
import Player from '../player'
import Match from '../match'

const { apiRoot } = config

const app = () => express(apiRoot, TournamentRouter)

let tournament, game, event, series, player, player2

beforeEach(async () => {
  game = await Game.create({ name: 'test' })
  event = await Event.create({})
  series = await Series.create({ game: game._id })
  player = await Player.create({
    handle: 'Ruler'
  })
  player2 = await Player.create({
    handle: 'Saber'
  })
  tournament = await Tournament.create({ _gameId: game._id, event: event._id, series: series._Id, players: [player._id] })
  await Tournament.create({ _gameId: game._id })
  await Match.create({
    _tournamentId: tournament._id,
    _player1Id: player._id,
    _player2Id: player2._id,
    _winnerId: player._id,
    _loserId: player2._id,
    round: 1,
    challongeMatchObj: {
      scores_csv: '2-1'
    }
  })
})

test('POST /tournaments 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const date = new Date()
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ name: 'test', type: 'test', _gameId: id, dateStart: date, dateEnd: date, players: id, event: id, series: id, bracket: 'test', bracketImage: 'test', meta: 'test', youtube: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.type).toEqual('test')
  expect(body._gameId).toEqual(id)
  expect(body.dateStart).toEqual(date.toISOString())
  expect(body.dateEnd).toEqual(date.toISOString())
  expect(body.players).toEqual([id])
  expect(body.event).toEqual(id)
  expect(body.series).toEqual(id)
  expect(body.bracket).toEqual('test')
  expect(body.bracketImage).toEqual('test')
  expect(body.meta).toEqual('test')
  expect(body.youtube).toEqual('test')
})

test('POST /tournaments 403 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('POST /tournaments 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /tournaments 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /tournaments?limit=1 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}?limit=1`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /tournaments/nogame 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/nogame`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /tournaments/:id 200', async () => {
  const response = await request(app())
    .get(`${apiRoot}/${tournament.id}`)
  const { status, body } = response
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(tournament.id)
})

test('GET /tournaments/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /tournaments/:id 200 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const date = new Date()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${tournament.id}?access_token=admin`)
    .send({ name: 'test', type: 'test', _gameId: id, dateStart: date, dateEnd: date, players: id, event: id, series: id, bracket: 'test', bracketImage: 'test', meta: 'test', youtube: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(tournament.id)
  expect(body.name).toEqual('test')
  expect(body.type).toEqual('test')
  expect(body._gameId).toEqual(id)
  expect(body.dateStart).toEqual(date.toISOString())
  expect(body.dateEnd).toEqual(date.toISOString())
  expect(body.players).toEqual([id])
  expect(body.event).toEqual(id)
  expect(body.series).toEqual(id)
  expect(body.bracket).toEqual('test')
  expect(body.bracketImage).toEqual('test')
  expect(body.meta).toEqual('test')
  expect(body.youtube).toEqual('test')
})

test('PUT /tournaments/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('PUT /tournaments/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}`)
  expect(status).toBe(401)
})

test('PUT /tournaments/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ name: 'test', type: 'test', _gameId: 'test', dateStart: 'test', dateEnd: 'test', players: 'test', event: 'test', series: 'test', bracket: 'test', bracketImage: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /tournaments/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${tournament.id}?access_token=admin`)
    .query({ })
  expect(status).toBe(204)
})

test('DELETE /tournaments/:id 403 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${tournament.id}?access_token=user`)
    .query({ })
  expect(status).toBe(403)
})

test('DELETE /tournaments/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${tournament.id}`)
  expect(status).toBe(401)
})

test('DELETE /tournaments/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456?access_token=admin')
    .query({ })
  expect(status).toBe(404)
})

test('GET /tournaments/:id/standings 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${tournament.id}/standings`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /tournaments/:id/standings 400', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/ksdjakdljklj1kl2j3kjkl123/standings`)
  expect(status).toBe(400)
})

test('GET /tournaments/:id/standings 404', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/123456789098765432123456/standings`)
  expect(status).toBe(404)
})

test('GET /tournaments/count 200', async () => {
  const { status, body } = await (request(app()))
    .get(`${apiRoot}/count`)
  expect(status).toBe(200)
  expect(body).toBe(2)
})

test('GET /tournaments/:id/matches 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${tournament.id}/matches`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /tournaments/:id/matches 400', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/ksdjakdljklj1kl2j3kjkl123/matches`)
  expect(status).toBe(400)
})

test('PUT /tournaments/:id/challonge 200', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${tournament.id}/challonge?access_token=admin`)
    .send({
      bracket: process.env.CHALLONGE_TEST_URL,
      _gameId: game._id.toString()
    })

  expect(status).toBe(200)
  expect(typeof body).toBe('object')
})

test('PUT /tournaments/:id/challonge 404 - no bracket url', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}/challonge?access_token=admin`)
    .send({
      _gameId: game._id.toString()
    })

  expect(status).toBe(404)
})

test('PUT /tournaments/:id/challonge 404 - tournament not found', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/123456789098765432123456/challonge?access_token=admin`)
    .send({
      bracket: process.env.CHALLONGE_TEST_URL,
      _gameId: game._id.toString()
    })

  expect(status).toBe(404)
})

test('PUT /tournaments/:id/challonge 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}/challonge?access_token=user`)
    .send({
      bracket: process.env.CHALLONGE_TEST_URL,
      _gameId: game._id.toString()
    })
  expect(status).toBe(403)
})

test('PUT /tournaments/:id/challonge 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}`)
    .send({
      bracket: process.env.CHALLONGE_TEST_URL,
      _gameId: game._id.toString()
    })
  expect(status).toBe(401)
})

test('GET /tournaments/:tournamentId/sheets 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${tournament.id}/sheets`)

  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /tournaments/:tournamentId/sheets 400', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/123badid123/sheets`)

  expect(status).toBe(400)
  expect(body.output.payload.message).toBe('Bad ID Parameter')
})

test('GET /tournaments/:tournamentId/sheets 404', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/123456789098765432123456/sheets`)

  expect(status).toBe(404)
  expect(body.output.payload.message).toBe('Not Found')
})
