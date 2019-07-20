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

export default {
  CharactersLoader: makeGeneralLoader(Character),
  ElosLoader: makeGeneralLoader(Elo),
  EventsLoader: makeGeneralLoader(Event),
  GamesLoader: makeGeneralLoader(Game),
  MatchesLoader: makeGeneralLoader(Match),
  PlayersLoader: makeGeneralLoader(Player),
  ResultsLoader: makeGeneralLoader(Result),
  TournamentsLoader: makeGeneralLoader(Tournament)
}
