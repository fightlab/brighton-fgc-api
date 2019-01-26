import Character from '.'
import { Types } from 'mongoose'

let character

beforeEach(async () => {
  character = await Character.create({
    name: `Jeanne d'Arc`,
    short: 'JEANNE',
    game: new Types.ObjectId()
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = character.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(character.id)
    expect(view.name).toBe(character.name)
    expect(view.short).toBe(character.short)
    expect(view.game).toBe(character.game)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})

describe('view', () => {
  it('returns full view', () => {
    const view = character.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(character.id)
    expect(view.name).toBe(character.name)
    expect(view.short).toBe(character.short)
    expect(view.game).toBe(character.game)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
