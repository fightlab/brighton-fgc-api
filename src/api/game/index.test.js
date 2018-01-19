import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Game } from '.'

const app = () => express(apiRoot, routes)

let userSession, adminSession, game

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  game = await Game.create({})
})

test('POST /games 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, name: 'test', short: 'test', imageUrl: 'test', bgUrl: 'test', meta: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.short).toEqual('test')
  expect(body.imageUrl).toEqual('test')
  expect(body.bgUrl).toEqual('test')
  expect(body.meta).toEqual('test')
})

test('POST /games 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('POST /games 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /games 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /games/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${game.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(game.id)
})

test('GET /games/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('GET /games/:id/tournaments 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${game.id}/tournaments`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('PUT /games/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${game.id}`)
    .send({ access_token: adminSession, name: 'test', short: 'test', imageUrl: 'test', bgUrl: 'test', meta: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(game.id)
  expect(body.name).toEqual('test')
  expect(body.short).toEqual('test')
  expect(body.imageUrl).toEqual('test')
  expect(body.bgUrl).toEqual('test')
  expect(body.meta).toEqual('test')
})

test('PUT /games/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${game.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /games/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${game.id}`)
  expect(status).toBe(401)
})

test('PUT /games/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', short: 'test', imageUrl: 'test', bgUrl: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /games/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${game.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /games/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${game.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /games/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${game.id}`)
  expect(status).toBe(401)
})

test('DELETE /games/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
