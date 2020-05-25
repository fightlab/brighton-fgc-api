import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { VodClass } from '@models/vod';
import { MatchClass } from '@models/match';
import { Character } from '@models/character';

export class MatchVodClass {
  @Property({
    required: true,
    ref: () => VodClass,
  })
  public vod!: Ref<VodClass>;

  @Property({
    required: true,
    ref: () => MatchClass,
  })
  public match!: Ref<MatchClass>;

  @Property({
    ref: () => Character,
  })
  public characters?: Array<Ref<Character>>;

  @Property({
    default: '0',
  })
  public timestamp?: string;
}

export const MatchVod = getModelForClass(MatchVodClass, {
  options: {
    customName: 'MatchVod',
  },
  schemaOptions: {
    collection: 'match_vod',
  },
});
