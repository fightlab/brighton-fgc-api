import { default as mongoose, Document, Schema } from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

interface Cat extends Document {
  name: string;
}

const CatSchema: Schema = new Schema({
  name: String,
});

const Cat = mongoose.model<Cat>('Cat', CatSchema);

Cat.find({}).then((cats) => {
  if (!cats.length) {
    new Cat({ name: 'Morgana' }).save().then((cat) => {
      console.log(cat.name);
    });
  } else {
    console.log(cats);
  }
});

console.log('hello cats');
