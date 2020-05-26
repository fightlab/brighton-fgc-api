import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { isDate } from 'moment';
import { Event } from '@models/event';
import { Game } from '@models/game';
import { Player } from '@models/player';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export enum TOURNAMENT_TYPE {
  DOUBLE_ELIMINATION,
  SINGLE_ELIMINATION,
  ROUND_ROBIN,
}

export class Tournament {
  @Property({ required: true })
  name!: string;

  @Property({
    required: true,
    validate: {
      validator: function (this: Tournament) {
        // since date end can be undefined, check for existence and then check if not valid
        if (
          isDate(this.date_end) &&
          this.date_end.getTime() < this.date_start.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_start',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  })
  date_start!: Date;

  @Property({
    validate: {
      validator: function (this: Tournament) {
        // undefined is a valid end date
        if (this.date_end === undefined) {
          return true;
        }

        if (!isDate(this.date_end)) {
          return false;
        }

        if (
          !isDate(this.date_start) ||
          this.date_start.getTime() > this.date_end.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_end',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  })
  date_end?: Date;

  @Property({
    required: true,
    enum: TOURNAMENT_TYPE,
    type: Number,
  })
  type!: TOURNAMENT_TYPE;

  @Property({
    required: true,
    ref: () => Event,
  })
  event!: Ref<Event>;

  @Property({
    required: true,
    ref: () => Game,
    default: [],
  })
  games!: Array<Ref<Game>>;

  @Property({
    required: true,
    ref: () => Player,
    default: [],
  })
  players?: Array<Ref<Player>>;

  @Property()
  is_team_based?: boolean;
}

export const TournamentModel = getModelForClass(Tournament, {
  options: {
    customName: 'Tournament',
  },
  schemaOptions: {
    collection: 'tournament',
  },
});
