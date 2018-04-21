import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Player, { PlayerRouter } from '.'
import Tournament from '../tournament'

const app = () => express(apiRoot, PlayerRouter)

let player, player1, player2, player3

beforeEach(async () => {
  player = await Player.create({
    isStaff: true,
    challongeUsername: 'player'
  })
  player1 = await Player.create({
    challongeUsername: 'player1'
  })
  player2 = await Player.create({
    challongeUsername: 'player2'
  })
  player3 = await Player.create({ })

  // create 5 tournaments
  await Tournament.create({
    players: [player._id, player1._id, player2._id, player3._id]
  })
  await Tournament.create({
    players: [player._id, player1._id, player2._id, player3._id]
  })
  await Tournament.create({
    players: [player._id, player1._id, player2._id, player3._id]
  })
  await Tournament.create({
    players: [player._id, player1._id, player3._id]
  })
  await Tournament.create({
    players: [player._id, player1._id, player3._id]
  })
})

test('POST /players 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', team: 'test', isStaff: true, emailHash: 'test', profile: { facebook: 'test' } })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.handle).toEqual('test')
  expect(body.challongeUsername).toEqual('test')
  expect(body.challongeName).toEqual(['test'])
  expect(body.imageUrl).toEqual('test')
  expect(body.team).toEqual('test')
  expect(body.emailHash).toEqual('test')
  expect(body.profile.facebook).toEqual('test')
  expect(body.isStaff).toEqual(true)
})

test('POST /players 403 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}?access_token=user`)
    .send({})
  expect(status).toBe(403)
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
  expect(body.length).toBe(4)
})

test('GET /players/index 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/index`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /players/index?all=true 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/index?all=true`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(3)
})

test('GET /players/index?staff=true 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/index?staff=true`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /players/index?limit=1 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/index?limit=1`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
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
    .put(`${apiRoot}/${player.id}?access_token=admin`)
    .send({ name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', team: 'test', isStaff: true, profile: { facebook: 'test' }, emailHash: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(player.id)
  expect(body.name).toEqual('test')
  expect(body.handle).toEqual('test')
  expect(body.challongeUsername).toEqual('test')
  expect(body.challongeName).toEqual(['test'])
  expect(body.imageUrl).toEqual('test')
  expect(body.team).toEqual('test')
  expect(body.emailHash).toEqual('test')
  expect(body.profile.facebook).toEqual('test')
  expect(body.isStaff).toEqual(true)
})

test('PUT /players/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${player.id}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('PUT /players/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${player.id}`)
  expect(status).toBe(401)
})

test('PUT /players/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', team: 'test', isStaff: 'test' })
  expect(status).toBe(404)
})

test('DELETE /players/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${player.id}?access_token=admin`)
    .query({})
  expect(status).toBe(204)
})

test('DELETE /players/:id 403 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${player.id}?access_token=user`)
    .query({})
  expect(status).toBe(403)
})

test('DELETE /players/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${player.id}`)
  expect(status).toBe(401)
})

test('DELETE /players/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456?access_token=admin')
    .query({})
  expect(status).toBe(404)
})

test('GET /players/:id/statistics 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/statistics`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
})
