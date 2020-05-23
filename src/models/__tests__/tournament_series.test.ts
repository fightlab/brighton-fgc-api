import { Types } from 'mongoose';
import { default as moment } from 'moment';
import {
  DocumentType,
  isDocument,
  isDocumentArray,
} from '@typegoose/typegoose';
import {
  Tournament,
  TOURNAMENT_TYPE,
  TournamentClass,
} from '@models/tournament';
import { Game, GameClass } from '@models/game';
import {
  TournamentSeriesClass,
  TournamentSeries,
} from '@models/tournament_series';

describe('Result model test', () => {
  let tournaments: Array<DocumentType<TournamentClass>>;
  let game: DocumentType<GameClass>;

  let tournamentSeriesFull: TournamentSeriesClass;
  let tournamentSeriesMin: TournamentSeriesClass;
  let tournamentSeries: DocumentType<TournamentSeriesClass>;

  beforeEach(async () => {
    // fake a game
    [game] = await Game.create([
      {
        name: 'Game 1',
        short: 'G1',
      },
    ] as Array<GameClass>);

    // fake some tournaments
    tournaments = await Tournament.create([
      {
        name: 'Tournament #1',
        date_start: moment.utc().subtract(1, 'd').toDate(),
        date_end: moment.utc().subtract(1, 'd').add(4, 'h').toDate(),
        event: new Types.ObjectId(),
        games: [game._id],
        type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
        is_team_based: false,
        players: [new Types.ObjectId()],
      },
      {
        name: 'Tournament #2',
        date_start: moment.utc().subtract(1, 'd').toDate(),
        date_end: moment.utc().subtract(1, 'd').add(4, 'h').toDate(),
        event: new Types.ObjectId(),
        games: [game._id],
        type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
        is_team_based: false,
        players: [new Types.ObjectId()],
      },
    ] as Array<TournamentClass>);

    tournamentSeriesFull = {
      name: 'Tournament Series Full',
      tournaments: tournaments.map((t) => t._id),
      game: game._id,
      info: 'Some info about this tournament series',
    };

    tournamentSeriesMin = {
      name: 'Tournament Series Min',
      tournaments: tournaments.map((t) => t._id),
    };

    [tournamentSeries] = await TournamentSeries.create([
      tournamentSeriesFull,
    ] as Array<TournamentSeriesClass>);
  });

  it('should create & save tournament series successfully', async () => {
    const input = new TournamentSeries(tournamentSeriesFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(tournamentSeriesFull.name);
    expect(output.info).toBe(tournamentSeriesFull.info);
    expect(output.tournaments).toHaveLength(2);
    expect(output.tournaments[0]?.toString()).toBe(
      tournamentSeriesFull.tournaments[0]?.toString(),
    );
    expect(output.tournaments[0]?.toString()).toBe(tournaments[0].id);
    expect(output.game?.toString()).toBe(tournamentSeriesFull.game?.toString());
    expect(output.game?.toString()).toBe(game.id);
  });

  it('should create & save min tournament series successfully', async () => {
    const input = new TournamentSeries(tournamentSeriesMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(tournamentSeriesMin.name);
    expect(output.tournaments).toHaveLength(2);
    expect(output.tournaments[0]?.toString()).toBe(
      tournamentSeriesFull.tournaments[0]?.toString(),
    );
    expect(output.tournaments[0]?.toString()).toBe(tournaments[0].id);
    expect(output.game).toBeUndefined();
    expect(output.info).toBeUndefined();
  });

  it('should populate tournaments', async () => {
    const output = await TournamentSeries.findById(
      tournamentSeries.id,
    ).populate('tournaments');

    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output.tournaments)).toBe(true);
      expect(isDocument(output.game)).toBe(false);
      if (isDocumentArray(output.tournaments)) {
        expect(output?.tournaments).toHaveLength(2);
        expect(output?.tournaments[0].id).toBe(tournaments[0].id);
      }
    }
  });

  it('should populate game', async () => {
    const output = await TournamentSeries.findById(
      tournamentSeries.id,
    ).populate('game');

    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output.tournaments)).toBe(false);
      expect(isDocument(output.game)).toBe(true);
      if (isDocument(output.game)) {
        expect(output?.game.id).toBe(game.id);
      }
    }
  });

  it('should populate all fields', async () => {
    const output = await TournamentSeries.findById(tournamentSeries.id)
      .populate('tournaments')
      .populate('game');

    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output.tournaments)).toBe(true);
      expect(isDocument(output.game)).toBe(true);
      if (isDocumentArray(output.tournaments) && isDocument(output.game)) {
        expect(output?.game.id).toBe(game.id);
        expect(output?.tournaments).toHaveLength(2);
        expect(output?.tournaments[0].id).toBe(tournaments[0].id);
      }
    }
  });
});
