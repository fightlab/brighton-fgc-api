import {
  DocumentType,
  isDocument,
  isDocumentArray,
} from '@typegoose/typegoose';
import { default as moment } from 'moment';
import { Types } from 'mongoose';
import { Event, EventClass } from '@models/event';
import { GameModel, Game } from '@models/game';
import { Player, PlayerClass } from '@models/player';
import { Tournament, TournamentClass, TOURNAMENT_TYPE } from '../tournament';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('Tournament model test', () => {
  let events: Array<DocumentType<EventClass>>;
  let games: Array<DocumentType<Game>>;
  let players: Array<DocumentType<PlayerClass>>;

  let tournamentFull: TournamentClass;
  let tournamentMin: TournamentClass;
  let tournament: DocumentType<TournamentClass>;

  const invalidDateString = 'lmao fake date';

  beforeEach(async () => {
    // fake some events
    events = await Event.create([
      {
        name: 'Event #1',
        venue: new Types.ObjectId(),
        date_end: moment.utc().subtract(1, 'd').toDate(),
        date_start: moment.utc().subtract(1, 'd').subtract(1, 'h').toDate(),
      },
      {
        name: 'Event #2',
        venue: new Types.ObjectId(),
        date_end: moment.utc().subtract(2, 'd').toDate(),
        date_start: moment.utc().subtract(2, 'd').subtract(2, 'h').toDate(),
      },
    ] as Array<EventClass>);

    // fake some games
    games = await GameModel.create([
      {
        name: 'Game 1',
        short: 'G1',
      },
      {
        name: 'Game 1',
        short: 'G2',
      },
    ] as Array<Game>);

    // fake some players
    players = await Player.create([
      {
        handle: 'LADS',
      },
      {
        handle: 'ON',
      },
      {
        handle: 'TOUR',
      },
    ] as Array<PlayerClass>);

    tournamentFull = {
      name: 'Tournament Full',
      date_start: events[0].date_start,
      date_end: events[0].date_end,
      type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
      event: events[0]._id,
      games: games.map((g) => g._id),
      players: players.map((p) => p._id),
      is_team_based: true,
    };

    tournamentMin = {
      name: 'Tournament Min',
      date_start: events[1].date_start,
      type: TOURNAMENT_TYPE.ROUND_ROBIN,
      event: events[1]._id,
      games: [games[0]._id],
    };

    [tournament] = await Tournament.create([tournamentFull] as Array<
      TournamentClass
    >);
  });

  it('should create & save tournament successfully', async () => {
    const input = new Tournament(tournamentFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(tournamentFull.name);
    expect(output.date_start.getTime()).toBe(
      tournamentFull.date_start.getTime(),
    );
    expect(output?.date_end?.getTime()).toBe(
      tournamentFull?.date_end?.getTime(),
    );
    expect(output.type).toBe(tournamentFull.type);
    expect(output.event?.toString()).toBe(output.event?.toString());
    expect(output.event?.toString()).toBe(events[0].id);
    expect(output.games).toHaveLength(games.length);
    expect(output.players).toHaveLength(players.length);
    expect(output.is_team_based).toBeTruthy();
  });

  it('should create & save min tournament successfully', async () => {
    const input = new Tournament(tournamentMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(tournamentMin.name);
    expect(output.date_start.getTime()).toBe(
      tournamentMin.date_start.getTime(),
    );
    expect(output?.date_end?.getTime()).toBeUndefined();
    expect(output.type).toBe(tournamentMin.type);
    expect(output.event?.toString()).toBe(output.event?.toString());
    expect(output.event?.toString()).toBe(events[1].id);
    expect(output.games).toHaveLength(1);
    expect(output.players).toHaveLength(0);
    expect(output.is_team_based).toBeFalsy();
  });

  it('should fail validation if trying to save with invalid start date', async () => {
    const input = new Tournament({
      ...tournamentMin,
      date_start: invalidDateString,
    });

    input.validate((error) => {
      expect(error.errors.date_start.message).toBe(
        `Cast to date failed for value "${invalidDateString}" at path "date_start"`,
      );
    });
  });

  it('should fail validation if start date after end date', async () => {
    const input = new Tournament({
      ...tournamentMin,
      date_start: moment.utc().add(5, 'h').toDate(),
      date_end: moment.utc().add(1, 'h').toDate(),
    });

    input.validate((error) => {
      expect(error.errors.date_start.message).toBe(
        generateValidationMessage(
          'date_start',
          VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
        ),
      );
    });
  });

  it('should fail validation if trying to save with invalid end date', async () => {
    const input = new Tournament({
      ...tournamentMin,
      date_end: invalidDateString,
    });

    input.validate((error) => {
      expect(error.errors.date_end.message).toBe(
        `Cast to date failed for value "${invalidDateString}" at path "date_end"`,
      );
    });
  });

  it('should fail validation if end date before start date', async () => {
    const input = new Tournament({
      ...tournamentMin,
      date_start: moment.utc().add(5, 'h').toDate(),
      date_end: moment.utc().add(1, 'h').toDate(),
    });

    input.validate((error) => {
      expect(error.errors.date_end.message).toBe(
        generateValidationMessage(
          'date_end',
          VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
        ),
      );
    });
  });

  it('should populate event', async () => {
    const output = await Tournament.findById(tournament._id).populate('event');

    expect(output).toBeDefined();

    if (output) {
      expect(isDocument(output?.event)).toBe(true);
      expect(output.players && isDocumentArray(output?.players)).toBe(false);
      expect(output?.games && isDocumentArray(output?.games)).toBe(false);

      if (isDocument(output?.event)) {
        expect(output?.event?.id).toBe(events[0].id);
      }
    }
  });

  it('should populate games', async () => {
    const output = await Tournament.findById(tournament._id).populate('games');

    expect(output).toBeDefined();

    if (output) {
      expect(isDocument(output?.event)).toBe(false);
      expect(output.players && isDocumentArray(output?.players)).toBe(false);
      expect(output?.games && isDocumentArray(output?.games)).toBe(true);

      if (output.games && isDocumentArray(output?.games)) {
        expect(output?.games).toHaveLength(games.length);
        expect(output?.games?.[0].id).toBe(games[0].id);
      }
    }
  });

  it('should populate players', async () => {
    const output = await Tournament.findById(tournament._id).populate(
      'players',
    );

    expect(output).toBeDefined();

    if (output) {
      expect(isDocument(output?.event)).toBe(false);
      expect(output.players && isDocumentArray(output?.players)).toBe(true);
      expect(output?.games && isDocumentArray(output?.games)).toBe(false);

      if (output.players && isDocumentArray(output?.players)) {
        expect(output?.players).toHaveLength(players.length);
        expect(output?.players?.[0].id).toBe(players[0].id);
      }
    }
  });

  it('should populate all fields', async () => {
    const output = await Tournament.findById(tournament._id)
      .populate('event')
      .populate('games')
      .populate('players');

    expect(output).toBeDefined();

    if (output) {
      expect(isDocument(output?.event)).toBe(true);
      expect(output.players && isDocumentArray(output?.players)).toBe(true);
      expect(output?.games && isDocumentArray(output?.games)).toBe(true);

      if (
        isDocument(output?.event) &&
        output.players &&
        isDocumentArray(output?.players) &&
        output.games &&
        isDocumentArray(output?.games)
      ) {
        expect(output?.event?.id).toBe(events[0].id);

        expect(output?.games).toHaveLength(games.length);
        expect(output?.games?.[0].id).toBe(games[0].id);

        expect(output?.players).toHaveLength(players.length);
        expect(output?.players?.[0].id).toBe(players[0].id);
      }
    }
  });
});
