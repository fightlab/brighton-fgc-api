import DataLoader from 'dataloader'
import sift from 'sift'
import Character from '../../common/character/model'
import Elo from '../../common/elo/model'
import Event from '../../common/event/model'
import Game from '../../common/game/model'
import Match from '../../common/match/model'
import Player from '../../common/player/model'
import Result from '../../common/result/model'
import Tournament from '../../common/tournament/model'

const makeGeneralLoader = schema => new DataLoader(queries => schema
  .find({ $or: queries })
  .then(docs => queries.map(query => sift(query, docs)))
)

const makeSingleGeneralLoader = schema => new DataLoader(queries => schema
  .find({ _id: { $in: queries } })
  .then(docs => queries.map(query => {
    const sifted = sift({ _id: query }, docs)
    if (sifted.length) return sifted[0]
    return {}
  }))
)

export default {
  CharactersLoader: makeGeneralLoader(Character),
  ElosLoader: makeGeneralLoader(Elo),
  EventsLoader: makeGeneralLoader(Event),
  GamesLoader: makeGeneralLoader(Game),
  MatchesLoader: makeGeneralLoader(Match),
  PlayersLoader: makeGeneralLoader(Player),
  ResultsLoader: makeGeneralLoader(Result),
  TournamentsLoader: makeGeneralLoader(Tournament),
  CharacterLoader: makeSingleGeneralLoader(Character),
  EloLoader: makeSingleGeneralLoader(Elo),
  EventLoader: makeSingleGeneralLoader(Event),
  GameLoader: makeSingleGeneralLoader(Game),
  MatchLoader: makeSingleGeneralLoader(Match),
  PlayerLoader: makeSingleGeneralLoader(Player),
  ResultLoader: makeSingleGeneralLoader(Result),
  TournamentLoader: makeSingleGeneralLoader(Tournament)
}
