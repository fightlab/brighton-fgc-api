import Character from '../../../common/character/model'

export default {
  Query: {
    characters: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Character.find(q)
    },
    character: (_, { id }) => Character.findById(id)
  }
}
