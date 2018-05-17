import Elo from '.'
import { Types } from 'mongoose'

let elo

beforeEach(async () => {
  elo = await Elo.create({
    player: new Types.ObjectId(),
    game: new Types.ObjectId(),
    elo: 1000,
    tournaments: [{
      tournament: new Types.ObjectId(),
      eloStart: 1000,
      eloEnd: 1000
    }]
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = elo.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(elo.id)
    expect(view.player).toBe(elo.player)
    expect(view.game).toBe(elo.game)
    expect(view.elo).toBe(elo.elo)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})

describe('view', () => {
  it('returns full view', () => {
    const view = elo.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(elo.id)
    expect(view.player).toBe(elo.player)
    expect(view.game).toBe(elo.game)
    expect(view.elo).toBe(elo.elo)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
