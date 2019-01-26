import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Elo, { EloRouter } from '.'
import { Types } from 'mongoose'

import Game from '../game'
import Player from '../player'
import Tournament from '../tournament'

const app = () => express(apiRoot, EloRouter)

let elo, player, game, tournament

beforeEach(async () => {
  player = await new Player()
  game = await new Game()
  tournament = await new Tournament()

  elo = await Elo.create({
    player: player.id,
    game: game.id,
    elo: 1000
  })
})

test('POST /elo 201 (admin)', async () => {
  const id = new Types.ObjectId().toString()
  const { status, body } = await request(app())
    .post(`${apiRoot}?access_token=admin`)
    .send({
      player: id,
      game: id,
      elo: 1001
    })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.player).toEqual(id)
  expect(body.game).toEqual(id)
  expect(body.elo).toEqual(1001)
})
