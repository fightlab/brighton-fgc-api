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

const gameResolver = ({ key = 'id', fieldName
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

const playerResolver = (playerKey = 'playerId') => (parent, args, context, info) => {
  if (parent[playerKey]) {
    return info.mergeInfo.delegateToSchema({
      schema: PlayerSchema,
      operation: 'query',
      fieldName: 'player',
      args: {
        id: parent[playerKey]
      },
      context,
      info
    })
  }
  return {}
}

const tournamentResolver = (tournamentKey = 'tournamentId') => (parent, args, context, info) => {
  if (parent[tournamentKey]) {
    return info.mergeInfo.delegateToSchema({
      schema: TournamentSchema,
      operation: 'query',
      fieldName: 'tournament',
      args: {
        id: parent[tournamentKey]
      },
      context,
      info
    })
  }
  return {}
}

const eventResolver = (eventKey = 'eventId') => (parent, args, context, info) => {
  if (parent[eventKey]) {
    return info.mergeInfo.delegateToSchema({
      schema: EventSchema,
      operation: 'query',
      fieldName: 'event',
      args: {
        id: parent[eventKey]
      },
      context,
      info
    })
  }
  return {}
}

const charactersResolver = (characterKey = 'characterIds') => (parent, args, context, info) => {
  if (parent[characterKey]) {
    return info.mergeInfo.delegateToSchema({
      schema: CharacterSchema,
      operation: 'query',
      fieldName: 'characters',
      args: {
        ids: parent[characterKey]
      },
      context,
      info
    })
  }
  return {}
}

const playersResolver = (playerKey = 'playerIds') => (parent, args, context, info) => {
  if (parent[playerKey]) {
    return info.mergeInfo.delegateToSchema({
      schema: PlayerSchema,
      operation: 'query',
      fieldName: 'players',
      args: {
        ids: parent[playerKey]
      },
      context,
      info
    })
  }
  return {}
}

const matchesResolver = ({ key = 'ids', fieldName = 'matches' }) => (parent, args, context, info) => {
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
        resolve: gameResolver({ fieldName: 'gameForCharacter' })
      },
      matches: {
        resolve: matchesResolver({ fieldName: 'matchesByCharacters', key: 'id' })
      }
    },
    Elo: {
      player: {
        resolve: playerResolver()
      },
      game: {
        resolve: gameResolver()
      }
    },
    Match: {
      tournament: {
        resolve: tournamentResolver()
      },
      player1: {
        resolve: playerResolver('player1Id')
      },
      player2: {
        resolve: playerResolver('player2Id')
      },
      winner: playerResolver('winnerId'),
      loser: playerResolver('loserId'),
      characters: charactersResolver()
    },
    Result: {
      player: {
        resolve: playerResolver()
      },
      tournament: {
        resolve: tournamentResolver()
      }
    },
    Tournament: {
      game: gameResolver(),
      players: playersResolver(),
      event: eventResolver()
    }
  }
})
