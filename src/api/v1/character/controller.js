import { success, notFound, badImplementation } from '../../../services/response/'
import Character from '.'

export const index = (req, res, next) =>
  Character.find({})
    .then((characters) => characters.map((character) => character.view()))
    .then(success(res))
    .catch(badImplementation(res))

export const show = ({ params }, res, next) =>
  Character.findById(params.id)
    .then(notFound(res))
    .then((character) => character ? character.view() : null)
    .then(success(res))
    .catch(badImplementation(res))
