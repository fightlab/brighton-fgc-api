
import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Event, { EventRouter } from '.'
import Tournament from '../tournament'
import Game from '../game'

const app = () => express(apiRoot, EventRouter)

let event, game

beforeEach(async () => {
  await Event.create({})
  event = await Event.create({})
  game = await Game.create({ name: 'test' })
  await Tournament.create({
    event: event._id,
    _gameId: game._id
  })
})

test('GET /events 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /events?limit=1 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}?limit=1`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /events/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${event.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(event.id)
})

test('GET /events/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('GET /events/:id/tournaments 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${event.id}/tournaments`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toEqual(1)
})

test('POST /events 201 (admin)', async () => {
  const date = new Date().toISOString()
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({ number: 1, name: 'test', date, url: 'test', venue: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.number).toEqual(1)
  expect(body.name).toEqual('test')
  expect(body.date).toEqual(date)
  expect(body.url).toEqual('test')
  expect(body.venue).toEqual('test')
})

test('POST /events 403 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}?access_token=user`)
    .send({ })
  expect(status).toBe(403)
})

test('POST /events 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('PUT /events/:id 200 (admin)', async () => {
  const date = new Date().toISOString()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${event.id}?access_token=admin`)
    .send({ number: 1, name: 'test', date, url: 'test', venue: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(event.id)
  expect(body.number).toEqual(1)
  expect(body.name).toEqual('test')
  expect(body.date).toEqual(date)
  expect(body.venue).toEqual('test')
  expect(body.url).toEqual('test')
})

test('PUT /events/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${event.id}?access_token=user`)
    .send({ })
  expect(status).toBe(403)
})

test('PUT /events/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${event.id}`)
  expect(status).toBe(401)
})

test('PUT /events/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ number: 'test', name: 'test', date: new Date().toISOString(), url: 'test', venue: 'test' })
  expect(status).toBe(404)
})

test('DELETE /events/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${event.id}?access_token=admin`)
    .query({ })
  expect(status).toBe(204)
})

test('DELETE /events/:id 403 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${event.id}?access_token=user`)
    .query({ })
  expect(status).toBe(403)
})

test('DELETE /events/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${event.id}`)
  expect(status).toBe(401)
})

test('DELETE /events/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456?access_token=admin')
    .query({ })
  expect(status).toBe(404)
})
