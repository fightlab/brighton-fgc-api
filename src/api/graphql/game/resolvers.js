import Game from '../../../common/game/model'

export default {
  Query: {
    games: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Game.find(q)
    },
    game: (_, { id }) => Game.findById(id)
  }
}
