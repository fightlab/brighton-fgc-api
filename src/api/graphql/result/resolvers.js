import Result from '../../../common/result/model'

export default {
  Query: {
    results: (_, { search }) => {
      const q = {}
      if (search) {
        q.$text = {
          $search: search
        }
      }
      return Result.find(q)
    },
    result: (_, { id }) => Result.findById(id)
  }
}
