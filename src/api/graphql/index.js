import { gql } from 'apollo-server-express'
import { mergeSchemas } from 'graphql-tools'

import PlayerSchema from './player'
import GameSchema from './game'
import CharacterSchema from './character'
import EloSchema from './elo'
import EventSchema from './event'
import MatchSchema from './match'
import ResultSchema from './result'
import TournamentSchema from './tournament'
import DateSchema from './scalars/date'

const linkTypeDefs = gql`
  extend type Character {
    game: Game
    matches(ids: [ID], tournaments: [ID], players: [ID], winners: [ID], losers: [ID], date_gte: Date, date_lte: Date, sort: [MatchSort]): [Match]
  }

  extend type Elo {
    player: Player
    game: Game
  }

  extend type Event {
    tournaments(sort: [TournamentSort], ids: [ID], players: [ID], games: [ID]): [Tournament]
  }

  extend type Game {
    tournaments(sort: [TournamentSort], ids: [ID], events: [ID], players: [ID]): [Tournament],
    characters(search: String, ids: [ID], sort: [CharacterSort]): [Character]
    elo(players: [ID], elo_gte: Int, elo_lte: Int, elo: Int, sort: [EloSort]): [Elo]
  }

  extend type Match {
    tournament: Tournament!
    player1: Player!
    player2: Player!
    winner: Player!
    loser: Player!
    characters(search: String, sort: [CharacterSort]): [Character]
  }

  extend type Player {
    tournaments(sort: [TournamentSort], ids: [ID], events: [ID], games: [ID]): [Tournament]
    elo(games: [ID], elo_gte: Int, elo_lte: Int, elo: Int, sort: [EloSort]): [Elo]
    matches(ids: [ID], tournaments: [ID], winners: [ID], losers: [ID], characters: [ID], date_gte: Date, date_lte: Date, sort: [MatchSort]): [Match]
  }

  extend type Result {
    player: Player
    tournament: Tournament
  }

  extend type Tournament {
    game: Game
    players(search: String, sort: [PlayerSort]): [Player]
    event: Event
    matches(ids: [ID], players: [ID], winners: [ID], losers: [ID], characters: [ID], date_gte: Date, date_lte: Date, sort: [MatchSort]): [Match]

  }
`

const delegateToSchema = ({ key, fieldName, schema, operation = 'query', arg = 'id', field = undefined, args = {} }) => (parent, _, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema,
      operation,
      fieldName,
      args: {
        [arg]: parent[key],
        field,
        ...args
      },
      context,
      info
    })
  }
  return {}
}

export default mergeSchemas({
  schemas: [
    DateSchema,
    PlayerSchema,
    GameSchema,
    EloSchema,
    EventSchema,
    MatchSchema,
    ResultSchema,
    CharacterSchema,
    TournamentSchema,
    linkTypeDefs
  ],
  resolvers: {
    Character: {
      game: {
        fragment: `... on Character { gameId }`,
        resolve: delegateToSchema({ key: 'gameId', fieldName: 'game', schema: GameSchema })
      },
      matches: {
        fragment: `... on Character { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'characters',
          schema: MatchSchema,
          fieldName: 'matches'
        })
      }
    },
    Elo: {
      player: {
        fragment: `... on Elo { playerId }`,
        resolve: delegateToSchema({ fieldName: 'player', key: 'playerId', schema: PlayerSchema })
      },
      game: {
        fragment: `... on Elo { gameId }`,
        resolve: delegateToSchema({ key: 'gameId', fieldName: 'game', schema: GameSchema })
      }
    },
    Event: {
      tournaments: {
        fragment: `... on Event { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'events',
          schema: TournamentSchema,
          fieldName: 'tournaments'
        })
      }
    },
    Game: {
      tournaments: {
        fragment: `... on Game { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'games',
          schema: TournamentSchema,
          fieldName: 'tournaments'
        })
      },
      characters: {
        fragment: `... on Game { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'games',
          schema: CharacterSchema,
          fieldName: 'characters'
        })
      },
      elo: {
        fragment: `... on Game { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'games',
          schema: EloSchema,
          fieldName: 'elos'
        })
      }
    },
    Match: {
      tournament: {
        fragment: `... on Match { tournamentId }`,
        resolve: delegateToSchema({ key: 'tournamentId', fieldName: 'tournament', schema: TournamentSchema })
      },
      player1: {
        fragment: `... on Match { player1Id }`,
        resolve: delegateToSchema({ key: 'player1Id', schema: PlayerSchema, fieldName: 'player' })
      },
      player2: {
        fragment: `... on Match { player2Id }`,
        resolve: delegateToSchema({ key: 'player2Id', schema: PlayerSchema, fieldName: 'player' })
      },
      winner: {
        fragment: `... on Match { winnerId }`,
        resolve: delegateToSchema({ key: 'winnerId', schema: PlayerSchema, fieldName: 'player' })
      },
      loser: {
        fragment: `... on Match { loserId }`,
        resolve: delegateToSchema({ key: 'loserId', schema: PlayerSchema, fieldName: 'player' })
      },
      characters: {
        fragment: `... on Match { characterIds }`,
        resolve: delegateToSchema({
          key: 'characterIds',
          arg: 'ids',
          schema: CharacterSchema,
          fieldName: 'characters'
        })
      }
    },
    Player: {
      tournaments: {
        fragment: `... on Player { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'players',
          schema: TournamentSchema,
          fieldName: 'tournaments'
        })
      },
      elo: {
        fragment: `... on Player { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'players',
          schema: EloSchema,
          fieldName: 'elos'
        })
      },
      matches: {
        fragment: `... on Player { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'players',
          schema: MatchSchema,
          fieldName: 'matches'
        })
      }
    },
    Result: {
      player: {
        fragment: `... on Result { playerId }`,
        resolve: delegateToSchema({ fieldName: 'player', key: 'playerId', schema: PlayerSchema })
      },
      tournament: {
        fragment: `... on Result { tournamentId }`,
        resolve: delegateToSchema({ key: 'tournamentId', fieldName: 'tournament', schema: TournamentSchema })
      }
    },
    Tournament: {
      game: {
        fragment: `... on Tournament { gameId }`,
        resolve: delegateToSchema({ key: 'gameId', fieldName: 'game', schema: GameSchema })
      },
      players: {
        fragment: `... on Tournament { playerIds }`,
        resolve: delegateToSchema({
          key: 'playerIds',
          arg: 'ids',
          schema: PlayerSchema,
          fieldName: 'players',
          args: {
            all: true
          }
        })
      },
      event: {
        fragment: `... on Tournament { eventId }`,
        resolve: delegateToSchema({ key: 'eventId', fieldName: 'event', schema: EventSchema })
      },
      matches: {
        fragment: `... on Tournament { id }`,
        resolve: delegateToSchema({
          key: 'id',
          arg: 'matches',
          schema: MatchSchema,
          fieldName: 'matches'
        })
      }
    }
  }
})
