import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Event, { schema } from './model'
import { index, show, tournaments, create, update, destroy, count } from './controller'
import { isAdmin } from '../../../services/auth'

const EventRouter = new Router()
const { number, name, date, url, meta, venue } = schema.tree

EventRouter.get('/', index)

EventRouter.get('/count', count)

EventRouter.get('/:id', show)

EventRouter.get('/:id/tournaments', tournaments)

EventRouter.post('/', isAdmin, body({ number, name, date, url, meta, venue }), create)

EventRouter.put('/:id', isAdmin, body({ number, name, date, url, meta, venue }), update)

EventRouter.delete('/:id', isAdmin, destroy)

export default Event
export { EventRouter }
