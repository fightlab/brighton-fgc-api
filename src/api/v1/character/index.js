import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Character, { schema } from '../../../common/character/model'
import { index, show, merge, update } from './controller'
import { isAdmin } from '../../../services/auth'

const { name, short, game } = schema.tree

const CharacterRouter = new Router()

CharacterRouter.get('/', index)

CharacterRouter.get('/:id', show)

CharacterRouter.put('/:id', isAdmin, body({ name, short, game }), update)

CharacterRouter.put('/:correct/merge/:wrong', isAdmin, merge)

export default Character
export { CharacterRouter }
