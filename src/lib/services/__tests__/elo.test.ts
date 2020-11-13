import { Elo, ELO_RESULT } from '@lib/services/elo';

describe('Elo Service', () => {
  test('expected score for defaults', () => {
    const elo = new Elo();

    expect(elo.expectedScore(1000, 1000)).toBe(0.5);
    expect(elo.expectedScore(0, 1000)).toBeCloseTo(0);
    expect(elo.expectedScore(1000, 0)).toBeCloseTo(1);
    expect(elo.expectedScore(1400, 1200)).toBeCloseTo(0.76);
    expect(elo.expectedScore(1200, 1400)).toBeCloseTo(0.24);

    // clamps ratings to be above 0
    expect(elo.expectedScore(-1000, 1000)).toBeCloseTo(0);
    expect(elo.expectedScore(1000, -1000)).toBeCloseTo(1);
    expect(elo.expectedScore(-1000, -1000)).toBe(0.5);
  });

  test('expected score for given min/max ratings', () => {
    const elo100to2000 = new Elo({
      options: {
        min: 100,
        max: 2000,
      },
    });

    // clamp 0 to 100 min
    expect(elo100to2000.expectedScore(0, 400)).toBeCloseTo(0.15);
    expect(elo100to2000.expectedScore(100, 400)).toBeCloseTo(0.15);
    expect(elo100to2000.expectedScore(0, 400)).toBeCloseTo(
      elo100to2000.expectedScore(0, 400),
    );

    expect(elo100to2000.expectedScore(400, 0)).toBeCloseTo(0.85);
    expect(elo100to2000.expectedScore(400, 100)).toBeCloseTo(0.85);
    expect(elo100to2000.expectedScore(400, 0)).toBeCloseTo(
      elo100to2000.expectedScore(400, 0),
    );

    // clamp 2500 to 2000 max
    expect(elo100to2000.expectedScore(2500, 1500)).toBeCloseTo(0.95);
    expect(elo100to2000.expectedScore(2000, 1500)).toBeCloseTo(0.95);
    expect(elo100to2000.expectedScore(2500, 1500)).toBeCloseTo(
      elo100to2000.expectedScore(2000, 1500),
    );

    expect(elo100to2000.expectedScore(1500, 2500)).toBeCloseTo(0.05);
    expect(elo100to2000.expectedScore(1500, 2000)).toBeCloseTo(0.05);
    expect(elo100to2000.expectedScore(1500, 2500)).toBeCloseTo(
      elo100to2000.expectedScore(1500, 2000),
    );
  });

  // https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
  // Suppose Player A has a rating of 1613 and plays in a five-round tournament.
  // He loses to a player rated 1609, draws with a player rated 1477,
  // defeats a player rated 1388, defeats a player rated 1586, and loses to a player rated 1720.
  // The player's actual score is (0 + 0.5 + 1 + 1 + 0) = 2.5.
  // The expected score, calculated according to the formula above,
  // was(0.51 + 0.69 + 0.79 + 0.54 + 0.35) = 2.88.
  // Therefore, the player's new rating is(1613 + 32(2.5 − 2.88)) = 1601,
  // assuming that a K - factor of 32 is used.
  test('calculate same score for given player from wikipedia', () => {
    const elo = new Elo();

    const playerA = 1613;

    // rounding to 2dp for use with wikipedia calculations
    const expectedScore =
      +elo.expectedScore(playerA, 1609).toFixed(2) +
      +elo.expectedScore(playerA, 1477).toFixed(2) +
      +elo.expectedScore(playerA, 1388).toFixed(2) +
      +elo.expectedScore(playerA, 1586).toFixed(2) +
      +elo.expectedScore(playerA, 1720).toFixed(2);

    expect(expectedScore).toBeCloseTo(2.88);
  });

  test('calculate same rating as wikipedia', () => {
    const elo = new Elo();

    const playerA = 1613;

    const expectedScore = 2.88;
    const actualScore = 2.5;

    const newRating = elo.newRating(expectedScore, actualScore, playerA);

    expect(newRating).toBe(1601);
  });

  test('calculate rating for a given match', () => {
    const elo = new Elo();

    const rating = 1440;

    // win against 1000
    expect(
      elo.newRating(elo.expectedScore(rating, 1000), ELO_RESULT.WIN, rating),
    ).toBe(1442);

    // draw against 1000
    expect(
      elo.newRating(elo.expectedScore(rating, 1000), ELO_RESULT.DRAW, rating),
    ).toBe(1426);

    // lose against 1000
    expect(
      elo.newRating(elo.expectedScore(rating, 1000), ELO_RESULT.LOSS, rating),
    ).toBe(1410);
  });

  test('calculate rating for a given match without rounding', () => {
    const elo = new Elo();

    const rating = 1440;

    // win against 1000
    expect(
      elo.newRating(
        elo.expectedScore(rating, 1000),
        ELO_RESULT.WIN,
        rating,
        false,
      ),
    ).toBeCloseTo(1442.35);

    // draw against 1000
    expect(
      elo.newRating(
        elo.expectedScore(rating, 1000),
        ELO_RESULT.DRAW,
        rating,
        false,
      ),
    ).toBeCloseTo(1426.35);

    // lose against 1000
    expect(
      elo.newRating(
        elo.expectedScore(rating, 1000),
        ELO_RESULT.LOSS,
        rating,
        false,
      ),
    ).toBeCloseTo(1410.35);
  });

  test('clamp calculated rating to given options', () => {
    const elo = new Elo({
      options: {
        min: 700,
        max: 1400,
      },
    });

    const rating1 = 1399;
    const rating2 = 701;

    // rating 1 win
    expect(
      elo.newRating(elo.expectedScore(rating1, 1300), ELO_RESULT.WIN, rating1),
    ).toBe(1400);

    // rating 2 loss
    expect(
      elo.newRating(elo.expectedScore(rating2, 800), ELO_RESULT.LOSS, rating2),
    ).toBe(700);
  });

  test('calculate new rating for different kFactor', () => {
    const elo = new Elo({
      kFactor: {
        default: 40,
      },
    });

    const rating = 1440;

    // win against 1000
    expect(
      elo.newRating(elo.expectedScore(rating, 1000), ELO_RESULT.WIN, rating),
    ).toBe(1443);

    // draw against 1000
    expect(
      elo.newRating(elo.expectedScore(rating, 1000), ELO_RESULT.DRAW, rating),
    ).toBe(1423);

    // lose against 1000
    expect(
      elo.newRating(elo.expectedScore(rating, 1000), ELO_RESULT.LOSS, rating),
    ).toBe(1403);
  });

  test('calculate ratings for different kFactors at different ratings', () => {
    const elo = new Elo({
      kFactor: {
        default: 32,
        ratings: [
          [1400, 24],
          [1200, 28],
        ],
      },
    });

    // above 1400, use kFactor 24
    expect(
      elo.newRating(elo.expectedScore(1444, 1000), ELO_RESULT.WIN, 1444),
    ).toBe(1446);

    // above 1200, use kFactor 28
    expect(
      elo.newRating(elo.expectedScore(1250, 1000), ELO_RESULT.WIN, 1250),
    ).toBe(1255);

    // else use default 32
    expect(
      elo.newRating(elo.expectedScore(1050, 1000), ELO_RESULT.WIN, 1050),
    ).toBe(1064);
  });
});
