import { prop as Property, getModelForClass } from '@typegoose/typegoose';

export class Player {
  @Property({ required: true })
  public handle!: string;

  @Property()
  public icon?: string;

  @Property()
  public team?: string;

  @Property({ default: false })
  public is_staff?: boolean;
}

export const PlayerModel = getModelForClass(Player, {
  options: {
    customName: 'Player',
  },
  schemaOptions: {
    collection: 'player',
  },
});
