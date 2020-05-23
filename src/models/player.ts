import { prop as Property, getModelForClass } from '@typegoose/typegoose';

export class PlayerClass {
  @Property({ required: true })
  public handle!: string;

  @Property()
  public icon?: string;

  @Property()
  public team?: string;

  @Property({ default: false })
  public is_staff?: boolean;
}

export const Player = getModelForClass(PlayerClass, {
  options: {
    customName: 'Player',
  },
  schemaOptions: {
    collection: 'player',
  },
});
