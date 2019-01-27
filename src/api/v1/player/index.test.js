import { createHash } from 'crypto'
import _ from 'lodash'
import request from 'supertest'
import { apiRoot } from '../../../config'
import express from '../../../services/express'
import Player, { PlayerRouter } from '.'
import Tournament from '../tournament'
import Match from '../match'
import Game from '../game'
import Elo from '../elo'
import Result from '../result'

const app = () => express(apiRoot, PlayerRouter)

let player, player1, player2, player3, user, tournament, game, result

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

  user = await Player.create({ name: 'user', emailHash: createHash('md5').update('user').digest('hex') })

  game = await Game.create({ name: 'game', imageUrl: 'game' })

  // create 5 tournaments
  tournament = await Tournament.create({
    players: [player._id, player1._id, player2._id, player3._id],
    name: 'tournament',
    _gameId: game._id
  })

  result = await Result.create({
    _playerId: player._id,
    _tournamentId: tournament._id,
    rank: 1,
    eloBefore: 1000,
    eloAfter: 1100
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

  // create match
  await Match.create({
    _tournamentId: tournament._id,
    _player1Id: player._id,
    _player2Id: player2._id,
    _winnerId: player._id,
    _loserId: player2._id,
    score: [{
      p1: 2,
      p2: 1
    }],
    round: 1,
    challongeMatchObj: {},
    startDate: new Date(),
    endDate: new Date()
  })

  await Match.create({
    _tournamentId: tournament._id,
    _player1Id: player._id,
    _player2Id: player3._id,
    _winnerId: player._id,
    _loserId: player3._id,
    score: [{
      p1: 2,
      p2: 0
    }],
    round: 1,
    challongeMatchObj: {},
    startDate: new Date(),
    endDate: new Date()
  })

  await Elo.create({
    player: player._id,
    matches: 11,
    elo: 1111,
    game: game._id
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
  expect(body.length).toBe(5)
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

test('GET /players/me 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/me?access_token=user`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(user.id)
  expect(body.emailHash).toEqual(createHash('md5').update('user').digest('hex'))
})

test('GET /players/me 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/me?access_token=admin')
  expect(status).toBe(404)
})

test('PUT /players/me 200', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/me?access_token=user`)
    .send({ name: 'test', handle: 'test2', profile: { facebook: 'test3' } })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(user.id)
  expect(body.name).toEqual('user')
  expect(body.handle).toEqual('test2')
  expect(body.profile.facebook).toEqual('test3')
})

test('PUT /players/me 404', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/me?access_token=admin`)
    .send({ name: 'test', handle: 'test2', profile: { facebook: 'test3' } })
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

test('GET /players/:player1/statistics/:player2 404', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${player.id}/statistics/${player1.id}`)
  expect(status).toBe(404)
})

test('GET /players/:player1/statistics/:player2 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/statistics/${player2.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
})

test('GET /players/:player1/opponents 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/opponents`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.length).toBe(1)
})

test('GET /players/:player1/opponents 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/opponents?all=true`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.length).toBe(2)
})

test('GET /players/:id/elo 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/elo`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
  expect(body[0].elo).toBe(1111)
  expect(body[0].matches).toBe(11)
  expect(body[0].player).toBe(player._id.toString())
  expect(body[0].game.name).toBe(game.name)
  expect(body[0].game.imageUrl).toBe(game.imageUrl)
  expect(body[0].game.id).toBe(game._id.toString())
})

test('GET /players/:id/elo 400 - bad id parameter', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/asd456fsa4654f/elo`)
  expect(status).toBe(400)
  expect(body.output.payload.message).toBe('Bad ID Parameter')
})

test('GET /players/:id/results/:gameId 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/results/${game.id}`)

  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
  expect(body[0]._tournamentId.name).toBe(tournament.name)
  expect(body[0]._tournamentId.id).toBe(tournament._id.toString())
  expect(body[0].rank).toBe(result.rank)
  expect(body[0].eloBefore).toBe(result.eloBefore)
  expect(body[0].eloAfter).toBe(result.eloAfter)
  expect(body[0].id).toBe(result._id.toString())
})

test('GET /players/:id/results/:gameId 400 - bad id', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/asd456fsa4654f/results/${game.id}`)

  expect(status).toBe(400)
  expect(body.output.payload.message).toBe('Bad ID Parameter')
})

test('GET /players/:id/results/:gameId 400 - bad game id', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/results/asd456fsa4654f`)

  expect(status).toBe(400)
  expect(body.output.payload.message).toBe('Bad ID Parameter')
})

test('GET /players/:id/matches/:gameId 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/matches/${game.id}`)

  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /players/:id/matches/:gameId 400 - bad id', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/asd456fsa4654f/matches/${game.id}`)

  expect(status).toBe(400)
  expect(body.output.payload.message).toBe('Bad ID Parameter')
})

test('GET /players/:id/matches/:gameId 400 - bad game id', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${player.id}/matches/asd456fsa4654f`)

  expect(status).toBe(400)
  expect(body.output.payload.message).toBe('Bad ID Parameter')
})
