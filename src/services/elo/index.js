import Arpad from 'arpad'
import _ from 'lodash'

const arpad = new Arpad()

class Elo {
  constructor ({ def = 30, elo1400 = 20, match30 = 60, elo = 1000, matches = 0 }) {
    this.arpad = new Arpad(def)
    this.matches = matches
    this.elo = elo
    this.range = {
      default: def,
      elo1400,
      match30
    }

    this.getKFactor = this.getKFactor.bind(this)
    this.getElo = this.getElo.bind(this)
    this.setElo = this.setElo.bind(this)

    this.arpad.setKFactor(this.getKFactor())
  }

  static eloScore (scores) {
    let score
    if (scores.length > 1) {
      score = _.reduce(scores, (result, value) => {
        result.p1 += value.p1
        result.p2 += value.p2

        return result
      }, { p1: 0, p2: 0 })
    } else {
      score = scores[0]
    }

    const total = score.p1 + score.p2
    if (total === 0) return 0.5
    return score.p1 / total
  }

  static expectedScore (p1elo, p2elo) {
    return arpad.expectedScore(p1elo, p2elo)
  }

  getKFactor () {
    if (this.elo >= 1400) return this.range.elo1400
    if (this.matches < 30) return this.range.match30
    return this.range.default
  }

  getElo () {
    return this.elo
  }

  setElo (odds, score) {
    this.elo = this.arpad.newRating(odds, score, this.elo)
  }
}

export default Elo
