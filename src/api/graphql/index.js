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

  extend type Player {
    _playerId: Player
    _tournamentId: Tournament
  }

  extend type Tournament {
    _gameId: Game
    players: [Player]
    event: Event
  }
`

const gameResolver = (gameKey = 'gameId') => (parent, args, context, info) => {
  if (parent[gameKey]) {
    return info.mergeInfo.delegateToSchema({
      schema: GameSchema,
      operation: 'query',
      fieldName: 'game',
      args: {
        id: parent[gameKey]
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

const charactersResolver = (characterKey = 'characterIds') => (parent, args, context, info) => {
  console.log(parent)
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
        resolve: gameResolver()
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
    }
  }
})
