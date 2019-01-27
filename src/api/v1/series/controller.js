import _ from 'lodash'
import { Types } from 'mongoose'
import { success, notFound, badImplementation, badRequest } from '../../../services/response/'
import Series from '.'
import Tournament from '../tournament'
import Result from '../result'

const ObjectId = Types.ObjectId

export const create = ({ bodymen: { body } }, res, next) =>
  Series.create(body)
    .then(series => series.view(true))
    .then(success(res, 201))
    .catch(badImplementation(res))

export const index = (req, res, next) =>
  Series.find({})
    .populate({
      path: '_gameId',
      select: 'name id imageUrl'
    })
    .then(series => series.map(s => s.view()))
    .then(success(res))
    .catch(badImplementation(res))

export const show = ({ params }, res, next) =>
  Series.findById(params.id)
    .populate({
      path: '_gameId',
      select: 'name id imageUrl'
    })
    .then(notFound(res))
    .then(series => series ? series.view() : null)
    .then(success(res))
    .catch(badImplementation(res))

export const update = ({ bodymen: { body }, params }, res, next) =>
  Series.findById(params.id)
    .then(notFound(res))
    .then(series => series ? Object.assign(series, body).save() : null)
    .then(series => series ? series.view(true) : null)
    .then(success(res))
    .catch(badImplementation(res))

export const destroy = ({ params }, res, next) =>
  Series.findById(params.id)
    .then(notFound(res))
    .then(series => series ? series.remove() : null)
    .then(series => new Promise((resolve, reject) => {
      const proms = []

      // remove tournaments with series
      // remove from tournaments array
      proms.push(new Promise(async (resolve, reject) => {
        Tournament
          .update(
            { series: ObjectId(params.id) },
            { $unset: { series: '' } },
            { multi: true }
          )
          .then(resolve)
          .catch(reject)
      }))

      Promise
        .all(proms)
        .then(() => resolve(series))
        .catch(reject)
    }))
    .then(success(res, 204))
    .catch(badImplementation(res))

export const getTournaments = async ({ params, query }, res, next) => {
  try {
    ObjectId(params.id)
  } catch (e) {
    return badRequest(res)('Bad ID Parameter')
  }

  try {
    let tournaments = await Tournament
      .find({ series: ObjectId(params.id) })

    if (query.limit) {
      tournaments = _.take(tournaments, parseInt(query.limit) || 4)
    }

    return success(res)(tournaments)
  } catch (error) {
    return badImplementation(res)(error)
  }
}

export const getStandings = async ({ params, query }, res, next) => {
  try {
    ObjectId(params.id)
  } catch (e) {
    return badRequest(res)('Bad ID Parameter')
  }

  try {
    const series = await Series
      .findById(params.id)
      .then(series => series ? series.view() : null)

    if (!series) {
      return notFound(res)()
    }

    const tournaments = await Tournament
      .find({ series: ObjectId(params.id) })
      .select('id')

    const results = await Result
      .aggregate([{
        $match: {
          _tournamentId: {
            $in: _.map(tournaments, t => ObjectId(t.id))
          }
        }
      }, {
        $group: {
          _id: '$_playerId',
          rank: { $push: '$rank' }
        }
      }, {
        $lookup: {
          from: 'players',
          localField: '_id',
          foreignField: '_id',
          as: '_playerId'
        }
      }, {
        $unwind: '$_playerId'
      }, {
        $project: {
          id: '$_id',
          _playerId: {
            id: '$_playerId._id',
            handle: '$_playerId.handle',
            emailHash: '$_playerId.emailHash',
            imageUrl: '$_playerId.imageUrl'
          },
          rank: 1
        }
      }])
      .exec()

    const points = [0, ...series.points || 0]

    let standings = _(results)
      .map(v => ({
        id: v.id,
        _playerId: v._playerId,
        rank: _(v.rank).map(r => points[r] || 0).sum()
      }))
      .orderBy('rank', 'desc')
      .value()

    if (query.limit) {
      standings = _.take(standings, parseInt(query.limit))
    }

    return success(res)(standings)
  } catch (error) {
    return badImplementation(res)(error)
  }
}
