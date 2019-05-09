import axios from 'axios'
import gql from 'gql-tag'
import _ from 'lodash'

const smashAPI = `https://api.smash.gg/gql/alpha`
const smashToken = process.env.SMASHGG_API_KEY

const callSmashGraphQL = ({ url = smashAPI, query, variables }) => axios({
  url,
  method: 'post',
  headers: {
    Authorization: `Bearer ${smashToken}`
  },
  data: {
    query,
    variables
  }
})

export default class SmashGG {
  static getTournament (idOrSlug = '') {
    let isSlug
    if (_.isString(idOrSlug)) {
      isSlug = true
    } else if (_.isNumber(idOrSlug)) {
      isSlug = false
    } else {
      return Promise.resolve({})
    }

    return callSmashGraphQL({
      query: gql`
        query TournamentInformation($tournament: String!){
          tournament(${isSlug ? 'slug' : 'id'}: $tournament){
            id
            name
            slug
            url
            events {
              id
              name
              slug
            }
          }
        }
      `,
      variables: {
        tournament: idOrSlug
      }
    })
  }

  static getEvent (id) {
    return callSmashGraphQL({
      query: gql`
        query Event($event: ID!){
          event(id: $event){
            id
            name
            slug
            url
            videogame {
              id
              name
              slug
              displayName
            }
            state
            startAt
          }
        }
      `,
      variables: {
        event: id
      }
    })
  }
}
