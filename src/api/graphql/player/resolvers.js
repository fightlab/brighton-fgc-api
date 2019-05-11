import Player from '../../../common/player/model'

export default {
  Query: {
    players: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Player.find(q)
    },
    player: (_, { id }) => Player.findById(id)
  }
}
