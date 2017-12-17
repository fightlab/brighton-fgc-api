import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Series } from '.'
import { Types } from 'mongoose'

const app = () => express(apiRoot, routes)

let userSession, adminSession, series

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  series = await Series.create({})
})

test('POST /series 201 (admin)', async () => {
  const game = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, name: 'test', game, isCurrent: true, meta: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.game).toEqual(game)
  expect(body.isCurrent).toEqual(true)
  expect(body.meta).toEqual('test')
})

test('POST /series 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('POST /series 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /series 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /series/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${series.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(series.id)
})

test('GET /series/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /series/:id 200 (admin)', async () => {
  const game = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${series.id}`)
    .send({ access_token: adminSession, name: 'test', game, isCurrent: true, meta: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(series.id)
  expect(body.name).toEqual('test')
  expect(body.game).toEqual(game)
  expect(body.isCurrent).toEqual(true)
  expect(body.meta).toEqual('test')
})

test('PUT /series/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${series.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /series/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${series.id}`)
  expect(status).toBe(401)
})

test('PUT /series/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', game: 'test', isCurrent: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /series/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${series.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /series/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${series.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /series/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${series.id}`)
  expect(status).toBe(401)
})

test('DELETE /series/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
