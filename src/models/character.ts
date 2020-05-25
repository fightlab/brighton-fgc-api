import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Game } from '@models/game';

export class CharacterClass {
  @Property({
    required: true,
    ref: () => Game,
  })
  public game!: Ref<Game>;

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
