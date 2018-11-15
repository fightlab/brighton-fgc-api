import { Router } from 'express'
import Character from './model'
import { index, show } from './controller'

const CharacterRouter = new Router()

CharacterRouter.get('/', index)

CharacterRouter.get('/:id', show)

export default Character
export { CharacterRouter }
