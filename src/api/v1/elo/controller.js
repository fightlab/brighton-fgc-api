import { success, notFound, badImplementation } from '../../../services/response'
import Elo from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Elo.create(body)
    .then(elo => elo.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))
