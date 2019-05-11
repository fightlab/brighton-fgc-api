import Tournament from '../../../common/tournament/model'

export default {
  Query: {
    tournaments: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Tournament.find(q)
    },
    tournament: (_, { id }) => Tournament.findById(id)
  }
}
