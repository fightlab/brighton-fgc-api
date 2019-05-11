import Event from '../../../common/event/model'

export default {
  Query: {
    events: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Event.find(q)
    },
    event: (_, { id }) => Event.findById(id)
  }
}
