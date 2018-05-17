import { Router } from 'express'

import { EventRouter } from './event'
import { GameRouter } from './game'
import { MatchRouter } from './match'
import { PlayerRouter } from './player'
import { ResultRouter } from './result'
import { SeriesRouter } from './series'
import { TournamentRouter } from './tournament'
import { EloRouter } from './elo'

const router = new Router()

router.use('/events', EventRouter)
router.use('/games', GameRouter)
router.use('/matches', MatchRouter)
router.use('/players', PlayerRouter)
router.use('/results', ResultRouter)
router.use('/series', SeriesRouter)
router.use('/tournaments', TournamentRouter)
router.use('/elo', EloRouter)

export default router
