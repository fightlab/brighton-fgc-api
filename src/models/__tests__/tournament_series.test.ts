import { CreateQuery, Types } from 'mongoose';
import { default as moment } from 'moment';
import {
  DocumentType,
  isDocument,
  isDocumentArray,
} from '@typegoose/typegoose';
import {
  TournamentModel,
  TOURNAMENT_TYPE,
  Tournament,
} from '@models/tournament';
import { GameModel, Game } from '@models/game';
import {
  TournamentSeries,
  TournamentSeriesModel,
} from '@models/tournament_series';

describe('Result model test', () => {
  let tournaments: Array<DocumentType<Tournament>>;
  let game: DocumentType<Game>;

  let tournamentSeriesFull: TournamentSeries;
  let tournamentSeriesMin: TournamentSeries;
  let tournamentSeries: DocumentType<TournamentSeries>;

  beforeEach(async () => {
    // fake a game
    [game] = await GameModel.create([
      {
        name: 'Game 1',
        short: 'G1',
      },
    ] as Array<Game>);

    // fake some tournaments
    tournaments = await TournamentModel.create([
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
    ] as CreateQuery<Tournament>[]);

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

    [tournamentSeries] = await TournamentSeriesModel.create([
      tournamentSeriesFull,
    ] as CreateQuery<TournamentSeries>[]);
  });

  it('should create & save tournament series successfully', async () => {
    const input = new TournamentSeriesModel(tournamentSeriesFull);
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
    const input = new TournamentSeriesModel(tournamentSeriesMin);
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
    const output = await TournamentSeriesModel.findById(
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
    const output = await TournamentSeriesModel.findById(
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
    const output = await TournamentSeriesModel.findById(tournamentSeries.id)
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
