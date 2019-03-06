import { Types } from 'mongoose'
import { success, notFound, badImplementation } from '../../../services/response/'
import Character from '.'
import Match from '../match'

const { ObjectId } = Types

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

export const update = ({ bodymen: { body }, params }, res, next) =>
  Character.findById(params.id)
    .then(notFound(res))
    .then((character) => character ? Object.assign(character, body).save() : null)
    .then((character) => character ? character.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const merge = async ({ params: { correct, wrong } }, res) => {
  try {
    const correctChar = await Character.findById(correct)
    if (!correctChar) return notFound(res)()
  } catch (error) {
    return badImplementation(res)(error)
  }

  await Match
    .update({
      characters: ObjectId(wrong)
    }, {
      $set: {
        'characters.$': ObjectId(correct)
      }
    }, {
      multi: true
    })

  Character
    .findByIdAndRemove(wrong)
    .then(success(res))
    .catch(badImplementation(res))
}
