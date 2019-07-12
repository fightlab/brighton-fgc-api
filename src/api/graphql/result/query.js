import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    results(sort: [ResultSort], ids: [ID], players: [ID], tournaments: [ID], rank: Int): [Result]
    result(id: ID!): Result
    resultsCount: Int
  }
`
