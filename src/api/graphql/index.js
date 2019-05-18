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

const linkTypeDefs = gql`
  extend type Character {
    game: Game
    matches: [Match]
  }

  extend type Elo {
    player: Player
    game: Game
  }

  extend type Match {
    tournament: Tournament!
    player1: Player!
    player2: Player!
    winner: Player!
    loser: Player!
    characters: [Character]
  }

  extend type Result {
    player: Player
    tournament: Tournament
  }

  extend type Tournament {
    game: Game
    players: [Player]
    event: Event
  }
`

const gameResolver = ({ key = 'gameId', fieldName
= 'game' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: GameSchema,
      operation: 'query',
      fieldName: fieldName,
      args: {
        id: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

const playerResolver = ({ key = 'playerId', fieldName
= 'player' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: PlayerSchema,
      operation: 'query',
      fieldName,
      args: {
        id: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

const tournamentResolver = ({ key = 'tournamentId', fieldName
= 'tournament' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: TournamentSchema,
      operation: 'query',
      fieldName,
      args: {
        id: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

const eventResolver = ({ key = 'eventId', fieldName
= 'event' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: EventSchema,
      operation: 'query',
      fieldName,
      args: {
        id: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

const charactersResolver = ({ key = 'characterIds', fieldName = 'characters' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: CharacterSchema,
      operation: 'query',
      fieldName,
      args: {
        ids: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

const playersResolver = ({ key = 'playerIds', fieldName = 'players' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: PlayerSchema,
      operation: 'query',
      fieldName,
      args: {
        ids: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

const matchesResolver = ({ key = 'ids', fieldName = 'matches' } = {}) => (parent, args, context, info) => {
  if (parent[key]) {
    return info.mergeInfo.delegateToSchema({
      schema: MatchSchema,
      operation: 'query',
      fieldName,
      args: {
        ids: parent[key]
      },
      context,
      info
    })
  }
  return {}
}

export default mergeSchemas({
  schemas: [
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
        resolve: gameResolver()
      },
      matches: {
        fragment: `... on Character { id }`,
        resolve: matchesResolver({ fieldName: 'matchesByCharacters', key: 'id' })
      }
    },
    Elo: {
      player: {
        fragment: `... on Elo { playerId }`,
        resolve: playerResolver()
      },
      game: {
        fragment: `... on Elo { gameId }`,
        resolve: gameResolver()
      }
    },
    Match: {
      tournament: {
        fragment: `... on Match { tournamentId }`,
        resolve: tournamentResolver()
      },
      player1: {
        fragment: `... on Match { player1Id }`,
        resolve: playerResolver({ key: 'player1Id' })
      },
      player2: {
        fragment: `... on Match { player2Id }`,
        resolve: playerResolver({ key: 'player2Id' })
      },
      winner: {
        fragment: `... on Match { winnerId }`,
        resolve: playerResolver({ key: 'winnerId' })
      },
      loser: {
        fragment: `... on Match { loserId }`,
        resolve: playerResolver({ key: 'loserId' })
      },
      characters: {
        fragment: `... on Match { characterIds }`,
        resolve: charactersResolver()
      }
    },
    Result: {
      player: {
        fragment: `... on Result { playerId }`,
        resolve: playerResolver()
      },
      tournament: {
        fragment: `... on Result { tournamentId }`,
        resolve: tournamentResolver()
      }
    },
    Tournament: {
      game: {
        fragment: `... on Tournament { gameId }`,
        resolve: gameResolver()
      },
      players: {
        fragment: `... on Tournament { playerIds }`,
        resolve: playersResolver()
      },
      event: {
        fragment: `... on Tournament { eventId }`,
        resolve: eventResolver()
      }
    }
  }
})
