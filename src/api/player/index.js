import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy, indexPlayers, stats } from './controller'
import { schema } from './model'
export Player, { schema } from './model'

const router = new Router()
const { name, handle, challongeUsername, challongeName, imageUrl, twitter, team, isStaff } = schema.tree

/**
 * @api {post} /players Create player
 * @apiName CreatePlayer
 * @apiGroup Player
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Player's name.
 * @apiParam handle Player's handle.
 * @apiParam challongeUsername Player's challongeUsername.
 * @apiParam challongeName Player's challongeName.
 * @apiParam imageUrl Player's imageUrl.
 * @apiParam twitter Player's twitter.
 * @apiParam team Player's team.
 * @apiParam isStaff Player's isStaff.
 * @apiSuccess {Object} player Player's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Player not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ name, handle, challongeUsername, challongeName, imageUrl, twitter, team, isStaff }),
  create)

/**
 * @api {get} /players Retrieve players
 * @apiName RetrievePlayers
 * @apiGroup Player
 * @apiUse listParams
 * @apiSuccess {Object[]} players List of players.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  index)

/**
 * @api {get} /players/index Retrieve players
 * @apiName RetrievePlayers
 * @apiGroup Player
 * @apiUse listParams
 * @apiSuccess {Object[]} players List of players.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/index',
  indexPlayers)

/**
 * @api {get} /players/:id Retrieve player
 * @apiName RetrievePlayer
 * @apiGroup Player
 * @apiSuccess {Object} player Player's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Player not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /players/:id Update player
 * @apiName UpdatePlayer
 * @apiGroup Player
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Player's name.
 * @apiParam handle Player's handle.
 * @apiParam challongeUsername Player's challongeUsername.
 * @apiParam challongeName Player's challongeName.
 * @apiParam imageUrl Player's imageUrl.
 * @apiParam twitter Player's twitter.
 * @apiParam team Player's team.
 * @apiParam isStaff Player's isStaff.
 * @apiSuccess {Object} player Player's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Player not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({ name, handle, challongeUsername, challongeName, imageUrl, twitter, team, isStaff }),
  update)

/**
 * @api {delete} /players/:id Delete player
 * @apiName DeletePlayer
 * @apiGroup Player
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Player not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

/**
 * @api {get} /players/:id Retrieve player
 * @apiName RetrievePlayer
 * @apiGroup Player
 * @apiSuccess {Object} player Player's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Player not found.
 */
router.get('/:id/statistics',
  stats)

export default router
