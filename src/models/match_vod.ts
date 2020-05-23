import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { VodClass } from '@models/vod';
import { MatchClass } from '@models/match';
import { CharacterClass } from '@models/character';

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
    ref: () => CharacterClass,
  })
  public characters?: Array<Ref<CharacterClass>>;

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
