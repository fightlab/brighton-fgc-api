import { Router } from 'express'

import { jwtCheck } from '../../services/jwt'

import { EventRouter } from './event'
import { GameRouter } from './game'
import { MatchRouter } from './match'
import { PlayerRouter } from './player'
import { ResultRouter } from './result'
import { SeriesRouter } from './series'
import { TournamentRouter } from './tournament'

const router = new Router()

router.get('/auth', jwtCheck, (req, res) => {
  console.log('auth route')
  console.log(req.user)
  return res.sendStatus(200)
})

router.get('/', (req, res) => {
  console.log('no auth route')
  return res.sendStatus(200)
})

router.use('/events', EventRouter)
router.use('/games', GameRouter)
router.use('/matches', MatchRouter)
router.use('/players', PlayerRouter)
router.use('/results', ResultRouter)
router.use('/series', SeriesRouter)
router.use('/tournaments', TournamentRouter)

export default router
