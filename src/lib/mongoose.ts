// Mongoose and MongoDB related things
// add any mongoose specific configuration here

import { default as mongoose } from 'mongoose';
import { getConfig } from '@lib/config';

const {
  mongo: { options },
} = getConfig();

Object.keys(options).forEach((key) => {
  mongoose.set(key, options[key]);
});

// mongo connection error, so stop whole process
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

export default mongoose;
