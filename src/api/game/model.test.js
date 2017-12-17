import { Game } from '.'

let game

beforeEach(async () => {
  game = await Game.create({ name: 'test', short: 'test', imageUrl: 'test', meta: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = game.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(game.id)
    expect(view.name).toBe(game.name)
    expect(view.short).toBe(game.short)
    expect(view.imageUrl).toBe(game.imageUrl)
    expect(view.meta).toBe(game.meta)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = game.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(game.id)
    expect(view.name).toBe(game.name)
    expect(view.short).toBe(game.short)
    expect(view.imageUrl).toBe(game.imageUrl)
    expect(view.meta).toBe(game.meta)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
