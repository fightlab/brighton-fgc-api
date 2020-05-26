import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { isNumber } from 'lodash';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export class Result {
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament!: Ref<Tournament>;

  @Property({
    required: true,
    ref: () => Player,
  })
  public players!: Array<Ref<Player>>;

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

export const ResultModel = getModelForClass(Result, {
  options: {
    customName: 'Result',
  },
  schemaOptions: {
    collection: 'result',
  },
});
