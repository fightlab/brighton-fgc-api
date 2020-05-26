import {
  DocumentType,
  isDocument,
  isDocumentArray,
} from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { default as moment } from 'moment';
import {
  TournamentModel,
  TOURNAMENT_TYPE,
  Tournament,
} from '@models/tournament';
import { PlayerModel, Player } from '@models/player';
import { Result, ResultModel } from '@models/result';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('Result model test', () => {
  let tournaments: Array<DocumentType<Tournament>>;
  let players: Array<DocumentType<Player>>;

  let resultFull: Result;
  let resultTeam: Result;
  let result: DocumentType<Result>;

  beforeEach(async () => {
    // fake some tournaments
    tournaments = await TournamentModel.create([
      {
        name: 'Tournament #1',
        date_start: moment.utc().subtract(1, 'd').toDate(),
        date_end: moment.utc().subtract(1, 'd').add(4, 'h').toDate(),
        event: new Types.ObjectId(),
        games: [new Types.ObjectId()],
        type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
        is_team_based: false,
        players: [new Types.ObjectId()],
      },
    ] as Array<Tournament>);

    // fake some players
    players = await PlayerModel.create([
      {
        handle: 'Player 0',
      },
      {
        handle: 'Player 1',
      },
    ] as Array<Player>);

    resultFull = {
      tournament: tournaments[0]._id,
      players: [players[0]._id],
      rank: 1,
    };

    resultTeam = {
      tournament: tournaments[0]._id,
      players: players.map((p) => p._id),
      rank: 2,
    };

    [result] = await ResultModel.create([resultFull] as Array<Result>);
  });

  it('should create & save result successfully', async () => {
    const input = new ResultModel(resultFull);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocumentArray(output?.players)).toBe(false);
    expect(isDocument(output?.tournament)).toBe(false);

    expect(output.tournament?.toString()).toBe(
      resultFull.tournament?.toString(),
    );
    expect(output.tournament?.toString()).toBe(tournaments[0].id);
    expect(output.players).toHaveLength(1);
    expect(output.players[0]?.toString()).toBe(
      resultFull.players[0]?.toString(),
    );
    expect(output.players[0]?.toString()).toBe(players[0].id);
    expect(output.rank).toBe(1);
  });

  it('should create & save result with multiple players successfully', async () => {
    const input = new ResultModel(resultTeam);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocumentArray(output?.players)).toBe(false);
    expect(isDocument(output?.tournament)).toBe(false);

    expect(output.tournament?.toString()).toBe(
      resultTeam.tournament?.toString(),
    );
    expect(output.tournament?.toString()).toBe(tournaments[0].id);
    expect(output.players).toHaveLength(2);
    expect(output.players[0]?.toString()).toBe(
      resultTeam.players[0]?.toString(),
    );
    expect(output.players[0]?.toString()).toBe(players[0].id);
    expect(output.players[1]?.toString()).toBe(
      resultTeam.players[1]?.toString(),
    );
    expect(output.players[1]?.toString()).toBe(players[1].id);
    expect(output.rank).toBe(2);
  });

  it('should populate tournament', async () => {
    const output = await ResultModel.findById(result.id).populate('tournament');

    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output?.players)).toBe(false);
      expect(isDocument(output?.tournament)).toBe(true);
      if (isDocumentArray(output?.players) && isDocument(output?.tournament)) {
        expect(output?.tournament.id).toBe(tournaments[0].id);
      }
    }
  });

  it('should populate players', async () => {
    const output = await ResultModel.findById(result.id).populate('players');

    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output?.players)).toBe(true);
      expect(isDocument(output?.tournament)).toBe(false);
      if (isDocumentArray(output?.players)) {
        expect(output?.players).toHaveLength(1);
        expect(output?.players?.[0].id).toBe(players[0].id);
      }
    }
  });

  it('should populate all fields', async () => {
    const output = await ResultModel.findById(result.id)
      .populate('tournament')
      .populate('players');

    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output?.players)).toBe(true);
      expect(isDocument(output?.tournament)).toBe(true);
      if (isDocumentArray(output?.players) && isDocument(output?.tournament)) {
        expect(output?.players).toHaveLength(1);
        expect(output?.players?.[0].id).toBe(players[0].id);
        expect(output?.tournament.id).toBe(tournaments[0].id);
      }
    }
  });

  it('should fail validation if rank is less than 0', async () => {
    const input = new ResultModel({
      tournament: tournaments[0]._id,
      players: [players[0]._id],
      rank: -1,
    });

    input.validate((error) => {
      expect(error.errors.rank.message).toBe(
        generateValidationMessage(
          'rank',
          VALIDATION_MESSAGES.RESULT_RANK_VALIDATION_ERROR,
        ),
      );
    });
  });

  it('should fail validation if rank is not a number', async () => {
    const input = new ResultModel({
      tournament: tournaments[0]._id,
      players: [players[0]._id],
      rank: '-1',
    });

    input.validate((error) => {
      expect(error.errors.rank.message).toBe(
        generateValidationMessage(
          'rank',
          VALIDATION_MESSAGES.RESULT_RANK_VALIDATION_ERROR,
        ),
      );
    });
  });
});
