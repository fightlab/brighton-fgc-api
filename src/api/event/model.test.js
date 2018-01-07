import { Event } from '.'

let event

beforeEach(async () => {
  event = await Event.create({ number: 1, name: 'test', date: 'test', url: 'test', meta: 'test' })
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
    expect(view.meta).toBe(event.meta)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
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
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})