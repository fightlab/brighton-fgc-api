import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Match, { MatchRouter } from '.'
import { Types } from 'mongoose'

const app = () => express(apiRoot, MatchRouter)

let match

beforeEach(async () => {
  const id = new Types.ObjectId().toString()
  const date = new Date()
  match = await Match.create({
    _tournamentId: id,
    _player1Id: id,
    _player2Id: id,
    _winnerId: id,
    _loserId: id,
    score: [{p1: 2, p2: 1}],
    round: 1,
    challongeMatchObj: 'test',
    startDate: date,
    endDate: date
  })
})

test('POST /matches 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const date = new Date().toISOString()
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ _tournamentId: id, _player1Id: id, _player2Id: id, _winnerId: id, _loserId: id, score: 'test', round: 1, challongeMatchObj: 'test', startDate: date, endDate: date, _player1EloBefore: 1, _player1EloAfter: 1, _player2EloBefore: 1, _player2EloAfter: 1 })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body._tournamentId).toEqual(id)
  expect(body._player1Id).toEqual(id)
  expect(body._player2Id).toEqual(id)
  expect(body._winnerId).toEqual(id)
  expect(body._loserId).toEqual(id)
  expect(body.score).toEqual(['test'])
  expect(body.round).toEqual(1)
  expect(body._player1EloBefore).toEqual(1)
  expect(body._player1EloAfter).toEqual(1)
  expect(body._player2EloAfter).toEqual(1)
  expect(body._player2EloBefore).toEqual(1)
  expect(body.challongeMatchObj).toEqual('test')
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
  const id = new Types.ObjectId().toString()
  const date = new Date().toISOString()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${match.id}?access_token=admin`)
    .send({ _tournamentId: id, _player1Id: id, _player2Id: id, _winnerId: id, _loserId: id, score: 'test', round: 1, challongeMatchObj: 'test', startDate: date, endDate: date, _player1EloBefore: 1, _player1EloAfter: 1, _player2EloBefore: 1, _player2EloAfter: 1 })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(match.id)
  expect(body._tournamentId).toEqual(id)
  expect(body._player1Id).toEqual(id)
  expect(body._player2Id).toEqual(id)
  expect(body._winnerId).toEqual(id)
  expect(body._loserId).toEqual(id)
  expect(body.score).toEqual(['test'])
  expect(body.round).toEqual(1)
  expect(body._player1EloBefore).toEqual(1)
  expect(body._player1EloAfter).toEqual(1)
  expect(body._player2EloAfter).toEqual(1)
  expect(body._player2EloBefore).toEqual(1)
  expect(body.challongeMatchObj).toEqual('test')
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
  expect(body).toBe(1)
})

test('GET /matches/count/games 200', async () => {
  const { status, body } = await (request(app()))
    .get(`${apiRoot}/count/games`)
  expect(status).toBe(200)
  expect(body).toBe(3)
})
