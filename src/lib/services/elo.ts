interface EloKFactor {
  default: number;
  ratings?: [number, number][];
}

interface EloOptions {
  min?: number;
  max?: number;
}

export enum ELO_RESULT {
  WIN = 1,
  DRAW = 0.5,
  LOSS = 0,
}

export class Elo {
  // magical perf const used by the algorithm
  private PERF_CONST = 400;

  // k factor options
  private kFactor: EloKFactor;

  // default k factor options
  private defaultKFactor: EloKFactor = {
    default: 32,
    ratings: [],
  };

  // minimum rating possible
  private min: number;

  // maximum rating possible
  private max: number;

  // default other options
  private defaultOpts: EloOptions = {
    min: 0,
    max: Infinity,
  };

  // clamp a number between the given min and max, defaults to class min/max
  private clamp(num: number, min = this.min, max = this.max): number {
    return Math.min(Math.max(min, num), max);
  }

  // gets the k factor for a given rating
  // or default k factor if no rating provided
  private kFactorForRating(rating: number): number {
    const { default: defaultKFactor, ratings: kFactorRatings } = this.kFactor;

    if (!kFactorRatings?.length) {
      return defaultKFactor;
    }

    return kFactorRatings
      .sort(([a], [b]) => a - b)
      .reduce((acc, [threshold, kFactorAtThreshold]) => {
        if (rating >= threshold) {
          return kFactorAtThreshold;
        }
        return acc;
      }, defaultKFactor);
  }

  constructor({
    kFactor,
    options,
  }: {
    kFactor?: EloKFactor;
    options?: EloOptions;
  } = {}) {
    const _kFactor: EloKFactor = { ...this.defaultKFactor, ...kFactor };
    const _options: EloOptions = { ...this.defaultOpts, ...options };

    this.kFactor = _kFactor!;
    this.min = _options.min!;
    this.max = _options.max!;
  }

  // calculated the expected score (outcome) of a given match
  // expressed as a number between 0 and 1
  // clamps ratings between class min and max
  expectedScore(playerRating: number, opponentRating: number): number {
    return (
      1 /
      (1 +
        10 **
          ((this.clamp(opponentRating) - this.clamp(playerRating)) /
            this.PERF_CONST))
    );
  }

  newRating(
    expectedScore: number,
    result: number,
    currentRating: number,
    roundToInteger = true,
  ): number {
    // get k factor for the current rating
    const kFactor = this.kFactorForRating(this.clamp(currentRating));

    // calculate difference between the actual score (result) and the expected score
    const diff = result - expectedScore;

    // calculate the new rating
    const rating = this.clamp(currentRating) + kFactor * diff;

    // clamp the result between the min and max
    const clamped = this.clamp(rating);

    // round to nearest integer, or return with decimals
    return roundToInteger ? Math.round(clamped) : clamped;
  }
}
