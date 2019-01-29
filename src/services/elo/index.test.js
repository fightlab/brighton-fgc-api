import Elo from '.'

let elo1, elo2

beforeEach(() => {
  elo1 = new Elo({ elo: 1100, matches: 43 })
  elo2 = new Elo({ elo: 980, matches: 21 })
})

test('eloScore 1-element array', () => {
  const score1 = Elo.eloScore([{ p1: 2, p2: 1 }])
  const score2 = Elo.eloScore([{ p1: 0, p2: 0 }])
  const score3 = Elo.eloScore([{ p1: 0, p2: 3 }])
  const score4 = Elo.eloScore([{ p1: -2, p2: 3 }])

  expect(score1).toBe(2 / 3)
  expect(score2).toBe(1 / 2)
  expect(score3).toBe(0)
  expect(score4).toBe(-2)
})

test('eloScore multi-element array', () => {
  const score1 = Elo.eloScore([{ p1: 2, p2: 1 }, { p1: 0, p2: 2 }, { p1: 1, p2: 2 }])
  const score2 = Elo.eloScore([{ p1: 3, p2: 1 }, { p1: 3, p2: 2 }, { p1: 3, p2: 2 }])

  expect(score1).toBe(0.375)
  expect(score2).toBe(9 / 14)
})

test('k-factor', () => {
  const elo3 = new Elo({ elo1400: 25, elo: 1450, matches: 123 })
  const elo4 = new Elo({ def: 50, elo1400: 30, match30: 100, elo: 1350, matches: 31 })
  expect(elo1.getKFactor()).toBe(30)
  expect(elo2.getKFactor()).toBe(60)
  expect(elo3.getKFactor()).toBe(25)
  expect(elo4.getKFactor()).toBe(50)
})
