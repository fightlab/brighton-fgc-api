import Match from '../../../common/match/model'

export default {
  Query: {
    matches: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Match.find(q)
    },
    match: (_, { id }) => Match.findById(id)
  }
}
