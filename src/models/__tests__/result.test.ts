import { Types } from 'mongoose';
import { default as moment } from 'moment';
import { Tournament, TOURNAMENT_TYPE, ITournament } from '@models/tournament';
import { Player, IPlayer } from '@models/player';
import { IResult, Result } from '@models/result';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('Result model test', () => {
  let tournaments: Array<Tournament>;
  let players: Array<Player>;

  let resultFull: IResult;
  let resultTeam: IResult;
  let result: Result;

  beforeEach(async () => {
    // fake some tournaments
    tournaments = await Tournament.create([
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
    ] as Array<ITournament>);

    // fake some players
    players = await Player.create([
      {
        handle: 'Player 0',
      },
      {
        handle: 'Player 1',
      },
    ] as Array<IPlayer>);

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

    [result] = await Result.create([resultFull] as Array<IResult>);
  });

  it('should create & save result successfully', async () => {
    const input = new Result(resultFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(resultFull.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[0].id);
    expect(output.players).toHaveLength(1);
    expect(output.players[0].toString()).toBe(resultFull.players[0].toString());
    expect(output.players[0].toString()).toBe(players[0].id);
    expect(output.rank).toBe(1);

    // shouldn't populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._players).toBeUndefined();
  });

  it('should create & save result with multiple players successfully', async () => {
    const input = new Result(resultTeam);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(resultTeam.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[0].id);
    expect(output.players).toHaveLength(2);
    expect(output.players[0].toString()).toBe(resultTeam.players[0].toString());
    expect(output.players[0].toString()).toBe(players[0].id);
    expect(output.players[1].toString()).toBe(resultTeam.players[1].toString());
    expect(output.players[1].toString()).toBe(players[1].id);
    expect(output.rank).toBe(2);

    // shouldn't populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._players).toBeUndefined();
  });

  it('should populate tournament', async () => {
    const output = await Result.findById(result.id).populate('_tournament');

    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);

    expect(output?._players).toBeUndefined();
  });

  it('should populate players', async () => {
    const output = await Result.findById(result.id).populate('_players');

    expect(output?._players).toBeDefined();
    expect(output?._players).toHaveLength(1);
    expect(output?._players?.[0].id).toBe(players[0].id);

    expect(output?._tournament).toBeUndefined();
  });

  it('should populate all fields', async () => {
    const output = await Result.findById(result.id)
      .populate('_tournament')
      .populate('_players');

    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);

    expect(output?._players).toBeDefined();
    expect(output?._players).toHaveLength(1);
    expect(output?._players?.[0].id).toBe(players[0].id);
  });

  it('should fail validation if rank is less than 0', async () => {
    const input = new Result({
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
    const input = new Result({
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
