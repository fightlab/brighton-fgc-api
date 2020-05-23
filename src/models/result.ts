import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { isNumber } from 'lodash';
import { TournamentClass } from '@models/tournament';
import { PlayerClass } from '@models/player';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export class ResultClass {
  @Property({
    required: true,
    ref: () => TournamentClass,
  })
  public tournament!: Ref<TournamentClass>;

  @Property({
    required: true,
    ref: () => PlayerClass,
  })
  public players!: Array<Ref<PlayerClass>>;

  @Property({
    required: true,
    default: 0,
    validate: {
      message: generateValidationMessage(
        'rank',
        VALIDATION_MESSAGES.RESULT_RANK_VALIDATION_ERROR,
      ),
      validator: (v: any) => isNumber(v) && v >= 0,
    },
  })
  public rank!: number;
}

export const Result = getModelForClass(ResultClass, {
  options: {
    customName: 'Result',
  },
  schemaOptions: {
    collection: 'result',
  },
});
