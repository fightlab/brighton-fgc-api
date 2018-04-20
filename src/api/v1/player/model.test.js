import Player from '.'

let player

beforeEach(async () => {
  player = await Player.create({
    name: 'test',
    handle: 'test',
    challongeUsername: 'test',
    challongeName: ['test'],
    imageUrl: 'test',
    challongeImageUrl: 'test',
    team: 'test',
    meta: { test: 'test' },
    isStaff: true,
    emailHash: 'test',
    profile: {
      facebook: 'test',
      twitter: 'test',
      instagram: 'test',
      web: 'test',
      playstation: 'test',
      xbox: 'test',
      discord: 'test',
      steam: 'test',
      github: 'test',
      twitch: 'test'
    }
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = player.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(player.id)
    expect(view.name).toBe(player.name)
    expect(view.handle).toBe(player.handle)
    expect(view.challongeUsername).toBe(player.challongeUsername)
    expect(view.imageUrl).toBe(player.imageUrl)
    expect(view.team).toBe(player.team)
    expect(view.isStaff).toBe(player.isStaff)
    expect(view.emailHash).toBe(player.emailHash)
    expect(view.profile.facebook).toBe(player.profile.facebook)
    expect(view.profile.twitter).toBe(player.profile.twitter)
    expect(view.profile.instagram).toBe(player.profile.instagram)
    expect(view.profile.web).toBe(player.profile.web)
    expect(view.profile.playstation).toBe(player.profile.playstation)
    expect(view.profile.xbox).toBe(player.profile.xbox)
    expect(view.profile.discord).toBe(player.profile.discord)
    expect(view.profile.steam).toBe(player.profile.steam)
    expect(view.profile.github).toBe(player.profile.github)
    expect(view.profile.twitch).toBe(player.profile.twitch)
    expect(view.challongeName).toBe(undefined)
    expect(view.challongeImageUrl).toBe(undefined)
    expect(view.meta).toBe(undefined)
    expect(view.updatedAt).toBe(undefined)
    expect(view.createdAt).toBe(undefined)
  })

  it('returns full view', () => {
    const view = player.view(true)
    expect(typeof view).toBe('object')
    expect(typeof view).toBe('object')
    expect(view.id).toBe(player.id)
    expect(view.name).toBe(player.name)
    expect(view.handle).toBe(player.handle)
    expect(view.challongeUsername).toBe(player.challongeUsername)
    expect(view.challongeName).toBe(player.challongeName)
    expect(view.imageUrl).toBe(player.imageUrl)
    expect(view.team).toBe(player.team)
    expect(view.isStaff).toBe(player.isStaff)
    expect(view.emailHash).toBe(player.emailHash)
    expect(view.profile.facebook).toBe(player.profile.facebook)
    expect(view.profile.twitter).toBe(player.profile.twitter)
    expect(view.profile.instagram).toBe(player.profile.instagram)
    expect(view.profile.web).toBe(player.profile.web)
    expect(view.profile.playstation).toBe(player.profile.playstation)
    expect(view.profile.xbox).toBe(player.profile.xbox)
    expect(view.profile.discord).toBe(player.profile.discord)
    expect(view.profile.steam).toBe(player.profile.steam)
    expect(view.profile.github).toBe(player.profile.github)
    expect(view.profile.twitch).toBe(player.profile.twitch)
    expect(view.meta.test).toBe(view.meta.test)
    expect(view.meta.challongeName).toBe(view.meta.challongeName)
    expect(view.meta.challongeImageUrl).toBe(view.meta.challongeImageUrl)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
