import request from 'supertest'
import { Types } from 'mongoose'
import config from '../../../config'
import express from '../../../services/express'
import Series, { SeriesRouter } from '.'
import Game from '../game'
import Tournament from '../tournament'

const { apiRoot } = config

const app = () => express(apiRoot, SeriesRouter)

let series, game

beforeEach(async () => {
  game = await Game.create({ name: 'test', imageUrl: 'test' })
  series = await Series.create({ _gameId: game._id })
  await Tournament.create({
    series: series._id
  })
  await Tournament.create({
    series: series._id
  })
})

test('POST /series 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ name: 'test', _gameId: id, isCurrent: true, points: [16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1], meta: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.points).toEqual([16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1])
  expect(body.name).toEqual('test')
  expect(body._gameId).toEqual(id)
  expect(body.isCurrent).toEqual(true)
  expect(body.meta).toEqual('test')
})

test('POST /series 403 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}?access_token=user`)
    .send({})
  expect(status).toBe(403)
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
  const id = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${series.id}?access_token=admin`)
    .send({ name: 'test', _gameId: id, isCurrent: true, points: [16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1], meta: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(series.id)
  expect(body.name).toEqual('test')
  expect(body.points).toEqual([16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1])
  expect(body._gameId).toEqual(id)
  expect(body.isCurrent).toEqual(true)
  expect(body.meta).toEqual('test')
})

test('PUT /series/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${series.id}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('PUT /series/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${series.id}`)
  expect(status).toBe(401)
})

test('PUT /series/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ name: 'test', _gameId: 'test', isCurrent: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /series/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${series.id}?access_token=admin`)
    .query({})
  expect(status).toBe(204)
})

test('DELETE /series/:id 403 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${series.id}?access_token=user`)
    .query({})
  expect(status).toBe(403)
})

test('DELETE /series/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${series.id}`)
  expect(status).toBe(401)
})

test('DELETE /series/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456?access_token=admin')
    .query({})
  expect(status).toBe(404)
})

test('GET /series/:id/standings 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${series.id}/standings`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /series/:id/standings 400', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/ksdjakdljklj1kl2j3kjkl123/standings`)
  expect(status).toBe(400)
})

test('GET /series/:id/tournaments 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${series.id}/tournaments`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /series/:id/tournaments?limit=1 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${series.id}/tournaments?limit=1`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /series/:id/tournaments 400', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/ksdjakdljklj1kl2j3kjkl123/tournaments`)
  expect(status).toBe(400)
})

test('GET /series/:id/standings 404', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/123456789098765432123456/standings`)
  expect(status).toBe(404)
})
