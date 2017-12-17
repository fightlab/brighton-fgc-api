import { success, notFound } from '../../services/response/'
import { Player } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Player.create(body)
    .then((player) => player.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Player.find(query, select, cursor)
    .then((players) => players.map((player) => player.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then((player) => player ? player.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then((player) => player ? Object.assign(player, body).save() : null)
    .then((player) => player ? player.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Player.findById(params.id)
    .then(notFound(res))
    .then((player) => player ? player.remove() : null)
    .then(success(res, 204))
    .catch(next)
