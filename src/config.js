/* eslint-disable no-unused-vars */
import path from 'path'
import dotenv from 'dotenv-safe'
import _ from 'lodash'

/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable')
  }
  return process.env[name]
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
    example: path.join(__dirname, '../.env.example')
  })
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
    apiRoot: process.env.API_ROOT || '',
    defaultEmail: 'no-reply@brighton-fgc-api.com',
    challongeApiKey: requireProcessEnv('CHALLONGE_API_KEY'),
    cloudinaryName: requireProcessEnv('CLOUDINARY_NAME'),
    cloudinaryApiKey: requireProcessEnv('CLOUDINARY_API_KEY'),
    cloudinarySecret: requireProcessEnv('CLOUDINARY_API_SECRET'),
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    }
  },
  test: {
    mongo: {
      uri: 'mongodb://localhost/brighton-fgc-api-test',
      options: {
        debug: false
      }
    }
  },
  development: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/brighton-fgc-api-dev',
      options: {
        debug: true
      }
    }
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/brighton-fgc-api'
    }
  }
}

const compiledConfig = _.merge({}, config.all, config[config.all.env])

export default compiledConfig
