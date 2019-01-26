import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Character, { CharacterRouter } from '.'
import Game from '../game'

const app = () => express(apiRoot, CharacterRouter)

let game, character

beforeEach(async () => {
  game = await Game.create({ name: 'F/GO' })
  character = await Character.create({
    name: `Jeanne d'Arc`,
    short: `JEANNE`,
    game: game._id
  })
  await Character.create({
    name: `Artoria Pendragon`,
    short: `ARTORIA`,
    game: game._id
  })
})

test('GET /characters 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)

  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
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
