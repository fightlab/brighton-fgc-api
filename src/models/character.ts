import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { GameClass } from '@models/game';

export class CharacterClass {
  @Property({
    required: true,
    ref: () => GameClass,
  })
  public game!: Ref<GameClass>;

  @Property({ required: true })
  public name!: string;

  @Property({ required: true })
  public short!: string;

  @Property()
  public image?: string;
}

export const Character = getModelForClass(CharacterClass, {
  options: {
    customName: 'Venue',
  },
  schemaOptions: {
    collection: 'venue',
  },
});
