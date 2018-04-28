import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Series, { schema } from './model'
import { create, index, show, update, destroy, getStandings, getTournaments } from './controller'
import { isAdmin } from '../../../services/auth'

const SeriesRouter = new Router()
const { name, _gameId, isCurrent, meta, points } = schema.tree

SeriesRouter.post('/', isAdmin, body({ name, _gameId, isCurrent, meta, points }), create)

SeriesRouter.get('/', index)

SeriesRouter.get('/:id/tournaments', getTournaments)

SeriesRouter.get('/:id/standings', getStandings)

SeriesRouter.get('/:id', show)

SeriesRouter.put('/:id', isAdmin, body({ name, _gameId, isCurrent, meta, points }), update)

SeriesRouter.delete('/:id', isAdmin, destroy)

export default Series
export { SeriesRouter }
