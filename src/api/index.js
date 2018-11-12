import { Router } from 'express'
import v1 from './v1'

const router = new Router()

router.get('/', (req, res) => res.status(200).send(process.env.npm_package_version))

router.use('/v1', v1)

export default router
