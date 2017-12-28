import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export Result, { schema } from './model'

const router = new Router()
const { _playerId, _tournamentId, rank, meta } = schema.tree

/**
 * @api {post} /results Create result
 * @apiName CreateResult
 * @apiGroup Result
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam _playerId Result's _playerId.
 * @apiParam _tournamentId Result's _tournamentId.
 * @apiParam rank Result's rank.
 * @apiParam meta Result's meta.
 * @apiSuccess {Object} result Result's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Result not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ _playerId, _tournamentId, rank, meta }),
  create)

/**
 * @api {get} /results Retrieve results
 * @apiName RetrieveResults
 * @apiGroup Result
 * @apiUse listParams
 * @apiSuccess {Object[]} results List of results.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /results/:id Retrieve result
 * @apiName RetrieveResult
 * @apiGroup Result
 * @apiSuccess {Object} result Result's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Result not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /results/:id Update result
 * @apiName UpdateResult
 * @apiGroup Result
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam _playerId Result's _playerId.
 * @apiParam _tournamentId Result's _tournamentId.
 * @apiParam rank Result's rank.
 * @apiParam meta Result's meta.
 * @apiSuccess {Object} result Result's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Result not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({ _playerId, _tournamentId, rank, meta }),
  update)

/**
 * @api {delete} /results/:id Delete result
 * @apiName DeleteResult
 * @apiGroup Result
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Result not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router
