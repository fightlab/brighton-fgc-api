import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Player } from '.'

const app = () => express(apiRoot, routes)

let userSession, adminSession, player

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  player = await Player.create({})
})

test('POST /players 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', twitter: 'test', team: 'test', isStaff: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.handle).toEqual('test')
  expect(body.challongeUsername).toEqual('test')
  expect(body.challongeName).toEqual('test')
  expect(body.imageUrl).toEqual('test')
  expect(body.twitter).toEqual('test')
  expect(body.team).toEqual('test')
  expect(body.isStaff).toEqual('test')
})

test('POST /players 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('POST /players 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /players 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /players/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(player.id)
})

test('GET /players/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /players/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${player.id}`)
    .send({ access_token: adminSession, name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', twitter: 'test', team: 'test', isStaff: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(player.id)
  expect(body.name).toEqual('test')
  expect(body.handle).toEqual('test')
  expect(body.challongeUsername).toEqual('test')
  expect(body.challongeName).toEqual('test')
  expect(body.imageUrl).toEqual('test')
  expect(body.twitter).toEqual('test')
  expect(body.team).toEqual('test')
  expect(body.isStaff).toEqual('test')
})

test('PUT /players/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${player.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /players/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${player.id}`)
  expect(status).toBe(401)
})

test('PUT /players/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', twitter: 'test', team: 'test', isStaff: 'test' })
  expect(status).toBe(404)
})

test('DELETE /players/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${player.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /players/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${player.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /players/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${player.id}`)
  expect(status).toBe(401)
})

test('DELETE /players/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
