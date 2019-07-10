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
    matches: [Match]
  }

  extend type Elo {
    player: Player
    game: Game
  }

  extend type Event {
    tournaments: [Tournament]
  }

  extend type Game {
    tournaments: [Tournament],
    characters: [Character]
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
    tournaments: [Tournament]
    elo: [Elo]
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

const delegateToSchema = ({ key, fieldName, schema, operation = 'query', arg = 'id', field }) => (parent, args, context, info) => {
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
        resolve: delegateToSchema({ fieldName: 'matchesByCharacters', key: 'id', schema: MatchSchema, arg: 'ids' })
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
        resolve: delegateToSchema({ key: 'id', fieldName: 'tournamentsByField', schema: TournamentSchema, field: 'EVENTID' })
      }
    },
    Game: {
      tournaments: {
        fragment: `... on Game { id }`,
        resolve: delegateToSchema({ key: 'id', fieldName: 'tournamentsByField', schema: TournamentSchema, field: 'GAMEID' })
      },
      characters: {
        fragment: `... on Game { id }`,
        resolve: delegateToSchema({ key: 'id', fieldName: 'charactersByField', schema: CharacterSchema, field: 'GAMEID' })
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
        resolve: delegateToSchema({ key: 'characterIds', schema: CharacterSchema, fieldName: 'characters', arg: 'ids' })
      }
    },
    Player: {
      tournaments: {
        fragment: `... on Player { id }`,
        resolve: delegateToSchema({ key: 'id', fieldName: 'tournamentsByField', schema: TournamentSchema, field: 'PLAYERID' })
      },
      elo: {
        fragment: `... on Player { id }`,
        resolve: delegateToSchema({ key: 'id', fieldName: 'elosByField', schema: EloSchema, field: 'PLAYERID' })
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
        resolve: delegateToSchema({ key: 'playerIds', fieldName: 'players', schema: PlayerSchema, arg: 'ids' })
      },
      event: {
        fragment: `... on Tournament { eventId }`,
        resolve: delegateToSchema({ key: 'eventId', fieldName: 'event', schema: EventSchema })
      }
    }
  }
})
