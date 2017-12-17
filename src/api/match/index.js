import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export Match, { schema } from './model'

const router = new Router()
const { _tournamentId, _player1Id, _player2Id, _winnerId, _loserId, score, round, challongeMatchObj } = schema.tree

/**
 * @api {post} /matches Create match
 * @apiName CreateMatch
 * @apiGroup Match
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam _tournamentId Match's _tournamentId.
 * @apiParam _player1Id Match's _player1Id.
 * @apiParam _player2Id Match's _player2Id.
 * @apiParam _winnerId Match's _winnerId.
 * @apiParam _loserId Match's _loserId.
 * @apiParam score Match's score.
 * @apiParam round Match's round.
 * @apiParam challongeMatchObj Match's challongeMatchObj.
 * @apiSuccess {Object} match Match's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Match not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ _tournamentId, _player1Id, _player2Id, _winnerId, _loserId, score, round, challongeMatchObj }),
  create)

/**
 * @api {get} /matches Retrieve matches
 * @apiName RetrieveMatches
 * @apiGroup Match
 * @apiUse listParams
 * @apiSuccess {Object[]} matches List of matches.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /matches/:id Retrieve match
 * @apiName RetrieveMatch
 * @apiGroup Match
 * @apiSuccess {Object} match Match's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Match not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /matches/:id Update match
 * @apiName UpdateMatch
 * @apiGroup Match
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam _tournamentId Match's _tournamentId.
 * @apiParam _player1Id Match's _player1Id.
 * @apiParam _player2Id Match's _player2Id.
 * @apiParam _winnerId Match's _winnerId.
 * @apiParam _loserId Match's _loserId.
 * @apiParam score Match's score.
 * @apiParam round Match's round.
 * @apiParam challongeMatchObj Match's challongeMatchObj.
 * @apiSuccess {Object} match Match's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Match not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({ _tournamentId, _player1Id, _player2Id, _winnerId, _loserId, score, round, challongeMatchObj }),
  update)

/**
 * @api {delete} /matches/:id Delete match
 * @apiName DeleteMatch
 * @apiGroup Match
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Match not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router
