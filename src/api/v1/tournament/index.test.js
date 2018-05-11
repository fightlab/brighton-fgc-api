import request from 'supertest'
import { Types } from 'mongoose'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Tournament, { TournamentRouter } from '.'
import Game from '../game'
import Event from '../event'
import Series from '../series'
import Player from '../player'

const app = () => express(apiRoot, TournamentRouter)

let tournament, game, event, series, player

beforeEach(async () => {
  game = Game.create({ name: 'test' })
  event = Event.create({})
  series = Series.create({ game: game._id })
  player = Player.create({})
  tournament = await Tournament.create({ _gameId: game._id, event: event._id, series: series._Id, players: [player._id] })
  await Tournament.create({ _gameId: game._id })
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
  expect(body.length).toBe(0)
})

test('GET /tournaments/:id/matches 400', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/ksdjakdljklj1kl2j3kjkl123/matches`)
  expect(status).toBe(400)
})
