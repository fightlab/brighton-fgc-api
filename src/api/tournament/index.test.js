import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Tournament } from '.'
import { Types } from 'mongoose'

const app = () => express(apiRoot, routes)

let userSession, adminSession, tournament

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  tournament = await Tournament.create({})
})

test('POST /tournaments 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const date = new Date()
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, name: 'test', type: 'test', _gameId: id, dateStart: date, dateEnd: date, players: id, event: id, series: id, bracket: 'test', bracketImage: 'test', meta: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.type).toEqual('test')
  expect(body._gameId).toEqual(id)
  expect(body.dateStart).toEqual(date.toISOString())
  expect(body.dateEnd).toEqual(date.toISOString())
  expect(body.players).toEqual([id])
  expect(body.event).toEqual([id])
  expect(body.series).toEqual([id])
  expect(body.bracket).toEqual('test')
  expect(body.bracketImage).toEqual('test')
  expect(body.meta).toEqual('test')
})

test('POST /tournaments 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
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
})

test('GET /tournaments/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${tournament.id}`)
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
    .put(`${apiRoot}/${tournament.id}`)
    .send({ access_token: adminSession, name: 'test', type: 'test', _gameId: id, dateStart: date, dateEnd: date, players: id, event: id, series: id, bracket: 'test', bracketImage: 'test', meta: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(tournament.id)
  expect(body.name).toEqual('test')
  expect(body.type).toEqual('test')
  expect(body._gameId).toEqual(id)
  expect(body.dateStart).toEqual(date.toISOString())
  expect(body.dateEnd).toEqual(date.toISOString())
  expect(body.players).toEqual([id])
  expect(body.event).toEqual([id])
  expect(body.series).toEqual([id])
  expect(body.bracket).toEqual('test')
  expect(body.bracketImage).toEqual('test')
  expect(body.meta).toEqual('test')
})

test('PUT /tournaments/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /tournaments/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${tournament.id}`)
  expect(status).toBe(401)
})

test('PUT /tournaments/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', type: 'test', _gameId: 'test', dateStart: 'test', dateEnd: 'test', players: 'test', event: 'test', series: 'test', bracket: 'test', bracketImage: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /tournaments/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${tournament.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /tournaments/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${tournament.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /tournaments/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${tournament.id}`)
  expect(status).toBe(401)
})

test('DELETE /tournaments/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
