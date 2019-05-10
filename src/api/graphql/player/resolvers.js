import Player from '../../../common/player/model'

export default {
  Query: {
    players: () => Player.find({}),
    player: (id) => Player.findById(id)
  }
}
