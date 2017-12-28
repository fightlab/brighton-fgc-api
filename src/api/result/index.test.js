import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Result } from '.'
import { Types } from 'mongoose'

const app = () => express(apiRoot, routes)

let userSession, adminSession, result

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  result = await Result.create({})
})

test('POST /results 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, _playerId: id.toString(), _tournamentId: id.toString(), rank: 1, meta: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body._playerId).toEqual(id.toString())
  expect(body._tournamentId).toEqual(id.toString())
  expect(body.rank).toEqual(1)
  expect(body.meta).toEqual('test')
})

test('POST /results 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('POST /results 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /results 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /results/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${result.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(result.id)
})

test('GET /results/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /results/:id 200 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${result.id}`)
    .send({ access_token: adminSession, _playerId: id.toString(), _tournamentId: id.toString(), rank: 1, meta: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(result.id)
  expect(body._playerId).toEqual(id.toString())
  expect(body._tournamentId).toEqual(id.toString())
  expect(body.rank).toEqual(1)
  expect(body.meta).toEqual('test')
})

test('PUT /results/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${result.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /results/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${result.id}`)
  expect(status).toBe(401)
})

test('PUT /results/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, _playerId: 'test', _tournamentId: 'test', rank: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /results/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${result.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /results/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${result.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /results/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${result.id}`)
  expect(status).toBe(401)
})

test('DELETE /results/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
