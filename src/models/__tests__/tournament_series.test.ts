import { Types } from 'mongoose';
import { default as moment } from 'moment';
import { Tournament, TOURNAMENT_TYPE, ITournament } from '@models/tournament';
import { Game, IGame } from '@models/game';
import { ITournamentSeries, TournamentSeries } from '@models/tournament_series';

describe('Result model test', () => {
  let tournaments: Array<Tournament>;
  let game: Game;

  let tournamentSeriesFull: ITournamentSeries;
  let tournamentSeriesMin: ITournamentSeries;
  let tournamentSeries: TournamentSeries;

  beforeEach(async () => {
    // fake a game
    [game] = await Game.create([
      {
        name: 'Game 1',
        short: 'G1',
      },
    ] as Array<IGame>);

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
    ] as Array<ITournament>);

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
    ] as Array<ITournamentSeries>);
  });

  it('should create & save tournament series successfully', async () => {
    const input = new TournamentSeries(tournamentSeriesFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(tournamentSeriesFull.name);
    expect(output.info).toBe(tournamentSeriesFull.info);
    expect(output.tournaments).toHaveLength(2);
    expect(output.tournaments[0].toString()).toBe(
      tournamentSeriesFull.tournaments[0].toString(),
    );
    expect(output.tournaments[0].toString()).toBe(tournaments[0].id);
    expect(output.game.toString()).toBe(tournamentSeriesFull.game.toString());
    expect(output.game.toString()).toBe(game.id);

    // shouldn't populate virtuals
    expect(output._tournaments).toBeUndefined();
    expect(output._game).toBeUndefined();
  });

  it('should create & save min tournament series successfully', async () => {
    const input = new TournamentSeries(tournamentSeriesMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(tournamentSeriesMin.name);
    expect(output.tournaments).toHaveLength(2);
    expect(output.tournaments[0].toString()).toBe(
      tournamentSeriesFull.tournaments[0].toString(),
    );
    expect(output.tournaments[0].toString()).toBe(tournaments[0].id);
    expect(output.game).toBeUndefined();
    expect(output.info).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._tournaments).toBeUndefined();
    expect(output._game).toBeUndefined();
  });

  it('should populate tournaments', async () => {
    const output = await TournamentSeries.findById(
      tournamentSeries.id,
    ).populate('_tournaments');

    expect(output?._tournaments).toBeDefined();
    expect(output?._tournaments).toHaveLength(2);
    expect(output?._tournaments?.[0].id).toBe(tournaments[0].id);

    expect(output?._game).toBeUndefined();
  });

  it('should populate game', async () => {
    const output = await TournamentSeries.findById(
      tournamentSeries.id,
    ).populate('_game');

    expect(output?._game).toBeDefined();
    expect(output?._game?.id).toBe(game.id);
    expect(output?._tournaments).toBeUndefined();
  });

  it('should populate all fields', async () => {
    const output = await TournamentSeries.findById(tournamentSeries.id)
      .populate('_tournaments')
      .populate('_game');

    expect(output?._game).toBeDefined();
    expect(output?._tournaments).toBeDefined();
    expect(output?._game?.id).toBe(game.id);
    expect(output?._tournaments).toHaveLength(2);
    expect(output?._tournaments?.[0].id).toBe(tournaments[0].id);
  });
});
