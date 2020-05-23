import { default as mongoose } from 'mongoose';
import {
  prop as Property,
  getModelForClass,
  Severity,
} from '@typegoose/typegoose';

export class GameClass {
  @Property({ required: true })
  public name!: string;

  @Property({ required: true })
  public short!: string;

  @Property()
  public logo?: string;

  @Property()
  public bg?: string;

  @Property({ type: mongoose.Schema.Types.Mixed })
  meta?: any;
}

export const Game = getModelForClass(GameClass, {
  options: {
    customName: 'Game',
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: 'game',
  },
});
