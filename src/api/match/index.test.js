import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Match } from '.'
import { Types } from 'mongoose'

const app = () => express(apiRoot, routes)

let userSession, adminSession, match

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  match = await Match.create({})
})

test('POST /matches 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, _tournamentId: id, _player1Id: id, _player2Id: id, _winnerId: id, _loserId: id, score: 'test', round: 1, challongeMatchObj: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body._tournamentId).toEqual(id)
  expect(body._player1Id).toEqual(id)
  expect(body._player2Id).toEqual(id)
  expect(body._winnerId).toEqual(id)
  expect(body._loserId).toEqual(id)
  expect(body.score).toEqual(['test'])
  expect(body.round).toEqual(1)
  expect(body.challongeMatchObj).toEqual('test')
})

test('POST /matches 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
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
  const { status, body } = await request(app())
    .put(`${apiRoot}/${match.id}`)
    .send({ access_token: adminSession, _tournamentId: id, _player1Id: id, _player2Id: id, _winnerId: id, _loserId: id, score: 'test', round: 1, challongeMatchObj: 'test' })
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
  expect(body.challongeMatchObj).toEqual('test')
})

test('PUT /matches/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${match.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /matches/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${match.id}`)
  expect(status).toBe(401)
})

test('PUT /matches/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, _tournamentId: 'test', _player1Id: 'test', _player2Id: 'test', _winnerId: 'test', _loserId: 'test', score: 'test', round: 'test', challongeMatchObj: 'test' })
  expect(status).toBe(404)
})

test('DELETE /matches/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${match.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /matches/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${match.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /matches/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${match.id}`)
  expect(status).toBe(401)
})

test('DELETE /matches/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
