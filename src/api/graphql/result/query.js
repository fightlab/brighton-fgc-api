import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    results(search: String): [Result]
    result(id: ID!): Result
    resultsCount: Int
  }
`
