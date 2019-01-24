import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Tournament, { schema } from './model'
import { create, index, indexNoGame, show, update, destroy, getStandings, challongeUpdate, count, matches, googleSheetsMatches } from './controller'
import { isAdmin } from '../../../services/auth'

const TournamentRouter = new Router()
const { name, type, _gameId, dateStart, dateEnd, players, event, series, signUpUrl, bracket, bracketImage, meta, youtube } = schema.tree

TournamentRouter.post('/', isAdmin, body({ name, type, _gameId, dateStart, dateEnd, players, event, series, signUpUrl, bracket, bracketImage, meta, youtube }), create)

TournamentRouter.get('/', index)

TournamentRouter.get('/count', count)

TournamentRouter.get('/nogame', indexNoGame)

TournamentRouter.get('/:id/standings', getStandings)

TournamentRouter.get('/:id/matches', matches)

TournamentRouter.get('/:tournamentId/sheets', googleSheetsMatches)

TournamentRouter.get('/:id', show)

TournamentRouter.put('/:id', isAdmin, body({ name, type, _gameId, dateStart, dateEnd, players, event, series, signUpUrl, bracket, bracketImage, meta, youtube }), update)

TournamentRouter.delete('/:id', isAdmin, destroy)

TournamentRouter.put('/:id/challonge', isAdmin, body({ bracket, _gameId }), challongeUpdate)

export default Tournament
export { TournamentRouter }
