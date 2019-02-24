import { Types } from 'mongoose'
import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Character, { CharacterRouter } from '.'
import Game from '../game'
import Match from '../match'

const { ObjectId } = Types

const app = () => express(apiRoot, CharacterRouter)

let game, character, wrongchar

beforeEach(async () => {
  game = await Game.create({ name: 'F/GO' })
  character = await Character.create({
    name: `Jeanne d'Arc`,
    short: `JEANNE`,
    game: game._id
  })
  wrongchar = await Character.create({
    name: 'Joan of Arc',
    short: 'JOAN',
    game: game._id
  })
  await Character.create({
    name: `Artoria Pendragon`,
    short: `ARTORIA`,
    game: game._id
  })
  await Match.create({
    _tournamentId: new ObjectId(),
    _player1Id: new ObjectId(),
    _player2Id: new ObjectId(),
    _winnerId: new ObjectId(),
    _loserId: new ObjectId(),
    score: [{p1: 2, p2: 1}],
    round: 1,
    challongeMatchObj: 'test',
    startDate: new Date(),
    endDate: new Date(),
    youtubeId: 'test',
    characters: [wrongchar._id],
    youtubeTimestamp: '1s',
    youtubeSeconds: 1
  })
})

test('GET /characters 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)

  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(3)
})

test('GET /characters/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${character.id}`)

  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(character.id)
  expect(body.name).toEqual(character.name)
  expect(body.short).toEqual(character.short)
  expect(body.game).toEqual(character.game.toString())
})

test('GET /characters/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /characters/:right/merge/:wrong 200', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${character.id}/merge/${wrongchar.id}?access_token=admin`)
  const match = await Match.findOne()

  expect(status).toBe(200)
  expect(match.characters[0].toString()).toBe(character.id.toString())
  expect(body.id).toBe(wrongchar.id.toString())
})

test('PUT /characters/:right/merge/:wrong 404', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/123456789098765432123456/merge/${wrongchar.id}?access_token=admin`)

  expect(status).toBe(404)
})

test('PUT /characters/:right/merge/:wrong 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${character.id}/merge/${wrongchar.id}?access_token=user`)

  expect(status).toBe(403)
})

test('PUT /characters/:right/merge/:wrong 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${character.id}/merge/${wrongchar.id}`)

  expect(status).toBe(401)
})

test('PUT /characters/:id 200 (admin)', async () => {
  const id = new ObjectId()
  const { status, body } = await request(app())
    .put(`${apiRoot}/${character.id}?access_token=admin`)
    .send({ name: 'test', short: 'test', game: id.toString() })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(character.id)
  expect(body.name).toEqual('test')
  expect(body.short).toEqual('test')
  expect(body.game).toEqual(id.toString())
})

test('PUT /characters/:id 403 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${character.id}?access_token=user`)
    .send({})
  expect(status).toBe(403)
})

test('PUT /characters/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${character.id}`)
  expect(status).toBe(401)
})

test('PUT /characters/:id 404 (admin)', async () => {
  const id = new ObjectId()
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456?access_token=admin')
    .send({ name: 'test', short: 'test', game: id.toString() })
  expect(status).toBe(404)
})
