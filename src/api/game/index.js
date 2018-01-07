import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export Game, { schema } from './model'

const router = new Router()
const { name, short, imageUrl, meta } = schema.tree

/**
 * @api {post} /games Create game
 * @apiName CreateGame
 * @apiGroup Game
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Game's name.
 * @apiParam short Game's short.
 * @apiParam imageUrl Game's imageUrl.
 * @apiParam meta Game's meta.
 * @apiSuccess {Object} game Game's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Game not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ name, short, imageUrl, meta }),
  create)

/**
 * @api {get} /games Retrieve games
 * @apiName RetrieveGames
 * @apiGroup Game
 * @apiUse listParams
 * @apiSuccess {Object[]} games List of games.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /games/:id Retrieve game
 * @apiName RetrieveGame
 * @apiGroup Game
 * @apiSuccess {Object} game Game's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Game not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /games/:id Update game
 * @apiName UpdateGame
 * @apiGroup Game
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Game's name.
 * @apiParam short Game's short.
 * @apiParam imageUrl Game's imageUrl.
 * @apiParam meta Game's meta.
 * @apiSuccess {Object} game Game's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Game not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({ name, short, imageUrl, meta }),
  update)

/**
 * @api {delete} /games/:id Delete game
 * @apiName DeleteGame
 * @apiGroup Game
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Game not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router