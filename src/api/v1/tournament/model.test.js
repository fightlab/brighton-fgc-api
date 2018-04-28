import Tournament from '.'
import { Types } from 'mongoose'

let tournament

beforeEach(async () => {
  tournament = await Tournament.create({
    name: 'test',
    type: 'test',
    _gameId: new Types.ObjectId(),
    dateStart: new Date(),
    dateEnd: new Date(),
    players: [new Types.ObjectId()],
    event: new Types.ObjectId(),
    series: new Types.ObjectId(),
    bracket: 'test',
    bracketImage: 'test',
    signUpUrl: 'test',
    challongeId: 1,
    youtube: 'test',
    meta: { test: 'test' }
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = tournament.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(tournament.id)
    expect(view.name).toBe(tournament.name)
    expect(view.type).toBe(tournament.type)
    expect(view._gameId).toBe(tournament._gameId)
    expect(view.dateStart).toBe(tournament.dateStart)
    expect(view.dateEnd).toBe(tournament.dateEnd)
    expect(view.players).toBe(tournament.players)
    expect(view.event).toBe(tournament.event)
    expect(view.series).toBe(tournament.series)
    expect(view.bracket).toBe(tournament.bracket)
    expect(view.bracketImage).toBe(tournament.bracketImage)
    expect(view.signUpUrl).toBe(tournament.signUpUrl)
    expect(view.challongeId).toBe(tournament.challongeId)
    expect(view.youtube).toBe(tournament.youtube)
    expect(view.meta).toBe(undefined)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = tournament.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(tournament.id)
    expect(view.name).toBe(tournament.name)
    expect(view.type).toBe(tournament.type)
    expect(view._gameId).toBe(tournament._gameId)
    expect(view.dateStart).toBe(tournament.dateStart)
    expect(view.dateEnd).toBe(tournament.dateEnd)
    expect(view.players).toBe(tournament.players)
    expect(view.event).toBe(tournament.event)
    expect(view.series).toBe(tournament.series)
    expect(view.bracket).toBe(tournament.bracket)
    expect(view.bracketImage).toBe(tournament.bracketImage)
    expect(view.signUpUrl).toBe(tournament.signUpUrl)
    expect(view.challongeId).toBe(tournament.challongeId)
    expect(view.youtube).toBe(tournament.youtube)
    expect(view.meta).toBe(tournament.meta)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
