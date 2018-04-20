import Event from '.'

let event

beforeEach(async () => {
  event = await Event.create({ number: 1, name: 'test', date: new Date(), url: 'test', venue: 'test', meta: { test: 'test' } })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = event.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(event.id)
    expect(view.number).toBe(event.number)
    expect(view.name).toBe(event.name)
    expect(view.date).toBe(event.date)
    expect(view.url).toBe(event.url)
    expect(view.venue).toBe(event.venue)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
    expect(view.meta).toBe(undefined)
  })

  it('returns full view', () => {
    const view = event.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(event.id)
    expect(view.number).toBe(event.number)
    expect(view.name).toBe(event.name)
    expect(view.date).toBe(event.date)
    expect(view.url).toBe(event.url)
    expect(view.meta).toBe(event.meta)
    expect(view.venue).toBe(event.venue)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
