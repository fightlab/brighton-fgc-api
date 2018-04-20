import Result from '.'
import { Types } from 'mongoose'

let result

beforeEach(async () => {
  result = await Result.create({
    _playerId: new Types.ObjectId(),
    _tournamentId: new Types.ObjectId(),
    rank: 1,
    meta: { test: 'test' }
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = result.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(result.id)
    expect(view._playerId).toBe(result._playerId)
    expect(view._tournamentId).toBe(result._tournamentId)
    expect(view.rank).toBe(result.rank)
    expect(view.meta).toBe(undefined)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = result.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(result.id)
    expect(view._playerId).toBe(result._playerId)
    expect(view._tournamentId).toBe(result._tournamentId)
    expect(view.rank).toBe(result.rank)
    expect(view.meta).toBe(result.meta)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
