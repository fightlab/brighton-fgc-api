import Match from '.'
import { Types } from 'mongoose'

let match

beforeEach(async () => {
  match = await Match.create({
    _tournamentId: new Types.ObjectId(),
    _player1Id: new Types.ObjectId(),
    _player2Id: new Types.ObjectId(),
    _winnerId: new Types.ObjectId(),
    _loserId: new Types.ObjectId(),
    score: 'test',
    round: 1,
    challongeMatchObj: { test: 'test' },
    startDate: new Date(),
    endDate: new Date()
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = match.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(match.id)
    expect(view._tournamentId).toBe(match._tournamentId)
    expect(view._player1Id).toBe(match._player1Id)
    expect(view._player2Id).toBe(match._player2Id)
    expect(view._winnerId).toBe(match._winnerId)
    expect(view._loserId).toBe(match._loserId)
    expect(view.score).toBe(match.score)
    expect(view.round).toBe(match.round)
    expect(view.startDate).toBe(match.startDate)
    expect(view.endDate).toBe(match.endDate)
    expect(view.challongeMatchObj).toBe(undefined)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = match.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(match.id)
    expect(view._tournamentId).toBe(match._tournamentId)
    expect(view._player1Id).toBe(match._player1Id)
    expect(view._player2Id).toBe(match._player2Id)
    expect(view._winnerId).toBe(match._winnerId)
    expect(view._loserId).toBe(match._loserId)
    expect(view.score).toBe(match.score)
    expect(view.round).toBe(match.round)
    expect(view.startDate).toBe(match.startDate)
    expect(view.endDate).toBe(match.endDate)
    expect(view.challongeMatchObj).toBe(match.challongeMatchObj)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
