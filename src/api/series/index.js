import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export Series, { schema } from './model'

const router = new Router()
const { name, _gameId, isCurrent, meta } = schema.tree

/**
 * @api {post} /series Create series
 * @apiName CreateSeries
 * @apiGroup Series
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Series's name.
 * @apiParam _gameId Series's _gameId.
 * @apiParam isCurrent Series's isCurrent.
 * @apiParam meta Series's meta.
 * @apiSuccess {Object} series Series's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Series not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ name, _gameId, isCurrent, meta }),
  create)

/**
 * @api {get} /series Retrieve series
 * @apiName RetrieveSeries
 * @apiGroup Series
 * @apiUse listParams
 * @apiSuccess {Object[]} series List of series.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /series/:id Retrieve series
 * @apiName RetrieveSeries
 * @apiGroup Series
 * @apiSuccess {Object} series Series's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Series not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /series/:id Update series
 * @apiName UpdateSeries
 * @apiGroup Series
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Series's name.
 * @apiParam _gameId Series's _gameId.
 * @apiParam isCurrent Series's isCurrent.
 * @apiParam meta Series's meta.
 * @apiSuccess {Object} series Series's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Series not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({ name, _gameId, isCurrent, meta }),
  update)

/**
 * @api {delete} /series/:id Delete series
 * @apiName DeleteSeries
 * @apiGroup Series
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Series not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router
