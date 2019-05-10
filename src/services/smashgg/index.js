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
            numEntrants
          }
        }
      `,
      variables: {
        event: id
      }
    })
  }

  static getEntrants (id, { page = 1, perPage = 25 }) {
    return callSmashGraphQL({
      query: gql`
        query Entrants($event: ID!, $page:Int!, $perPage:Int!){
          event(id: $event){
            id
            name
            slug
            entrants(
              page: $page
              perPage: $perPage
              sortType: ADMIN
            ) {
              pageInfo {
                total
                totalPages
                page
                perPage
              }
              nodes {
                id
                name
                participants {
                  id
                  gamerTag
                  prefix
                  userId
                  contactInfo {
                    name
                    nameFirst
                    nameLast
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        event: id,
        page,
        perPage
      }
    })
  }

  static getSets (id, { page = 1, perPage = 25 }) {
    return callSmashGraphQL({
      query: gql`
        query EventSets($event: ID!, $page:Int!, $perPage:Int!) {
          event(id:$event) {
            id
            name
            sets(
              page: $page
              perPage: $perPage
              sortType: ADMIN
            ) {
              pageInfo {
                total
                totalPages
                page
                perPage
              }
              nodes {
                id
                winnerId
                completedAt
                slots {
                  id
                  entrant {
                    id
                    participants {
                      id
                      userId
                    }
                  }
                  standing {
                    placement
                    stats {
                      score {
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        event: id,
        page,
        perPage
      }
    })
  }
}
