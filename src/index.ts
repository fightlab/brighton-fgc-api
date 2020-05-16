import { mongoose } from '@lib/mongoose';

mongoose.connect(process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('hello');
