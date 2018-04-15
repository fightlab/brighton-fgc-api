import { Router } from 'express'

import { jwtCheck } from '../../services/jwt'

const router = new Router()

router.get('/auth', jwtCheck, (req, res) => {
  console.log('auth route')
  return res.sendStatus(200)
})

router.get('/', (req, res) => {
  console.log('no auth route')
  return res.sendStatus(200)
})

export default router
