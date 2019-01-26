
import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Game, { GameRouter } from '.'
import Tournament from '../tournament'
import Elo from '../elo'
import Player from '../player'

const app = () => express(apiRoot, GameRouter)

let game, player1, player2

beforeEach(async () => {
  game = await Game.create({})
  await Tournament.create({
    _gameId: game._id
  })
  player1 = await Player.create({
    handle: 'Ruler'
  })
  player2 = await Player.create({
    handle: 'Saber'
  })
  await Elo.create({
    game: game._id,
    matches: 10,
    player: player1._id
  })
  await Elo.create({
    game: game._id,
    matches: 5,
    player: player2._id
  })
})

test('POST /games 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ name: 'test', short: 'test', imageUrl: 'test', bgUrl: 'test', meta: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.short).toEqual('test')
  expect(body.imageUrl).toEqual('test')
  expect(body.bgUrl).toEqual('test')
  expect(body.meta).toEqual('test')
})

test('POST /games 403 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}?access_token=user`)
    .send({})
  expect(status).toBe(403)
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

test('PUT /games/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${game.id}?access_token=admin`)
    .send({ name: 'test', short: 'test', imageUrl: 'test', bgUrl: 'test', meta: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(game.id)
  expect(body.name).toEqual('test')
  expect(body.short).toEqual('test')
  expect(body.imageUrl).toEqual('test')
  expect(body.bgUrl).toEqual('test')
  expect(body.meta).toEqual('test')
})

test('PUT /games/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${game.id}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('PUT /games/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${game.id}`)
  expect(status).toBe(401)
})

test('PUT /games/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ name: 'test', short: 'test', imageUrl: 'test', bgUrl: 'test', meta: 'test' })
  expect(status).toBe(404)
})

test('DELETE /games/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${game.id}?access_token=admin`)
    .query({})
  expect(status).toBe(204)
})

test('DELETE /games/:id 403 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${game.id}?access_token=user`)
    .query({})
  expect(status).toBe(403)
})

test('DELETE /games/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${game.id}`)
  expect(status).toBe(401)
})

test('DELETE /games/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456?access_token=admin')
    .query({})
  expect(status).toBe(404)
})

test('GET /games/:id/tournaments 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${game.id}/tournaments`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toEqual(1)
})

test('GET /games/:id/elo 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${game.id}/elo`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toEqual(1)
})

test('GET /games/:id/elo 400', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/123badid/elo`)
  expect(status).toBe(400)
})
