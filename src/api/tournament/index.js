import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, indexNoGame, show, update, destroy, challongeUpdate, getStandings } from './controller'
import { schema } from './model'
export Tournament, { schema } from './model'

const router = new Router()
const { name, type, _gameId, dateStart, dateEnd, players, event, series, signUpUrl, bracket, bracketImage, meta, youtube } = schema.tree

/**
 * @api {post} /tournaments Create tournament
 * @apiName CreateTournament
 * @apiGroup Tournament
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Tournament's name.
 * @apiParam type Tournament's type.
 * @apiParam _gameId Tournament's _gameId.
 * @apiParam dateStart Tournament's dateStart.
 * @apiParam dateEnd Tournament's dateEnd.
 * @apiParam players Tournament's players.
 * @apiParam event Tournament's event.
 * @apiParam series Tournament's series.
 * @apiParam signUpUrl Tournament's signUpUrl.
 * @apiParam bracket Tournament's bracket.
 * @apiParam bracketImage Tournament's bracketImage.
 * @apiParam meta Tournament's meta.
 * @apiSuccess {Object} tournament Tournament's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Tournament not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ name, type, _gameId, dateStart, dateEnd, players, event, series, signUpUrl, bracket, bracketImage, meta, youtube }),
  create)

/**
 * @api {get} /tournaments Retrieve tournaments
 * @apiName RetrieveTournaments
 * @apiGroup Tournament
 * @apiUse listParams
 * @apiSuccess {Object[]} tournaments List of tournaments.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /tournaments Retrieve tournaments
 * @apiName RetrieveTournaments
 * @apiGroup Tournament
 * @apiUse listParams
 * @apiSuccess {Object[]} tournaments List of tournaments.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/nogame',
  query(),
  indexNoGame)

/**
 * @api {get} /tournaments/:id/standings Retrieve standings for a tournament
 * @apiName RetrieveTournamentStandings
 * @apiGroup Tournament
 * @apiSuccess {Object[]} tournaments List of standings.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 422 Invalid parameter.
 */
router.get('/:id/standings',
  getStandings)

/**
 * @api {get} /tournaments/:id Retrieve tournament
 * @apiName RetrieveTournament
 * @apiGroup Tournament
 * @apiSuccess {Object} tournament Tournament's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Tournament not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /tournaments/:id Update tournament
 * @apiName UpdateTournament
 * @apiGroup Tournament
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Tournament's name.
 * @apiParam type Tournament's type.
 * @apiParam _gameId Tournament's _gameId.
 * @apiParam dateStart Tournament's dateStart.
 * @apiParam dateEnd Tournament's dateEnd.
 * @apiParam players Tournament's players.
 * @apiParam event Tournament's event.
 * @apiParam series Tournament's series.
 * @apiParam bracket Tournament's bracket.
 * @apiParam bracketImage Tournament's bracketImage.
 * @apiParam meta Tournament's meta.
 * @apiSuccess {Object} tournament Tournament's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Tournament not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({ name, type, _gameId, dateStart, dateEnd, players, event, series, signUpUrl, bracket, bracketImage, meta, youtube }),
  update)

/**
 * @api {delete} /tournaments/:id Delete tournament
 * @apiName DeleteTournament
 * @apiGroup Tournament
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Tournament not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

/**
 * @api {put} /tournaments/:id Update tournament from challonge
 * @apiName UpdateTournament
 * @apiGroup Tournament
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam bracket Tournament's bracket.
 * @apiSuccess {Object} tournament Tournament's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Tournament not found.
 * @apiError 401 admin access only.
 */
router.put('/:id/challonge',
  token({ required: true, roles: ['admin'] }),
  body({ bracket, _gameId }),
  challongeUpdate)

export default router
