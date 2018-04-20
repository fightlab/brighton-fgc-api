import Series from '.'
import { Types } from 'mongoose'

let series

beforeEach(async () => {
  series = await Series.create({
    name: 'test',
    _gameId: new Types.ObjectId(),
    points: [16, 12, 10, 8, 6, 6, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1],
    isCurrent: true,
    meta: { test: 'test' }
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = series.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(series.id)
    expect(view.name).toBe(series.name)
    expect(view._gameId).toBe(series._gameId)
    expect(view.points).toBe(series.points)
    expect(view.isCurrent).toBe(series.isCurrent)
    expect(view.meta).toBe(undefined)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = series.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(series.id)
    expect(view.name).toBe(series.name)
    expect(view.points).toBe(series.points)
    expect(view._gameId).toBe(series._gameId)
    expect(view.isCurrent).toBe(series.isCurrent)
    expect(view.meta).toBe(series.meta)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
