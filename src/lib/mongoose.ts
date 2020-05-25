// Mongoose and MongoDB related things
// add any mongoose specific configuration here

import { default as mongoose } from 'mongoose';

// mongo connection error, so stop whole process
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

export default mongoose;
