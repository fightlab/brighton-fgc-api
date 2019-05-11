import Elo from '../../../common/elo/model'

export default {
  Query: {
    elos: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Elo.find(q)
    },
    elo: (_, { id }) => Elo.findById(id)
  }
}
