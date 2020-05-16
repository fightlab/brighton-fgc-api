import { default as mongooseLib } from 'mongoose';

mongooseLib.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

export const mongoose = mongooseLib;
