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
    _tournamentId: Tournament!
    _player1Id: Player!
    _player2Id: Player!
    _winnerId: Player!
    _loserId: Player!
    score: [Score]
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
        resolve (character, args, context, info) {
          console.log(character)
          console.log(args)
          return info.mergeInfo.delegateToSchema({
            schema: GameSchema,
            operation: 'query',
            fieldName: 'game',
            args: {
              id: character.gameId
            },
            context,
            info
          })
        }
      }
    }
  }
})
