import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Vod } from '@models/vod';
import { Match } from '@models/match';
import { Character } from '@models/character';

export class MatchVod {
  @Property({
    required: true,
    ref: () => Vod,
  })
  public vod!: Ref<Vod>;

  @Property({
    required: true,
    ref: () => Match,
  })
  public match!: Ref<Match>;

  @Property({
    ref: () => Character,
  })
  public characters?: Array<Ref<Character>>;

  @Property({
    default: '0',
  })
  public timestamp?: string;
}

export const MatchVodModel = getModelForClass(MatchVod, {
  options: {
    customName: 'MatchVod',
  },
  schemaOptions: {
    collection: 'match_vod',
  },
});
