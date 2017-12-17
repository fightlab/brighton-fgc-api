import { Player } from '.'

let player

beforeEach(async () => {
  player = await Player.create({ name: 'test', handle: 'test', challongeUsername: 'test', challongeName: 'test', imageUrl: 'test', twitter: 'test', team: 'test', isStaff: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = player.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(player.id)
    expect(view.name).toBe(player.name)
    expect(view.handle).toBe(player.handle)
    expect(view.challongeUsername).toBe(player.challongeUsername)
    expect(view.challongeName).toBe(player.challongeName)
    expect(view.imageUrl).toBe(player.imageUrl)
    expect(view.twitter).toBe(player.twitter)
    expect(view.team).toBe(player.team)
    expect(view.isStaff).toBe(player.isStaff)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = player.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(player.id)
    expect(view.name).toBe(player.name)
    expect(view.handle).toBe(player.handle)
    expect(view.challongeUsername).toBe(player.challongeUsername)
    expect(view.challongeName).toBe(player.challongeName)
    expect(view.imageUrl).toBe(player.imageUrl)
    expect(view.twitter).toBe(player.twitter)
    expect(view.team).toBe(player.team)
    expect(view.isStaff).toBe(player.isStaff)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
