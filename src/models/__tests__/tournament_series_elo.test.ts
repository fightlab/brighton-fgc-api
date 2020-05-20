import { Types } from 'mongoose';
import {
  TournamentSeriesElo,
  ITournamentSeriesElo,
} from '@models/tournament_series_elo';
import { TournamentSeries, ITournamentSeries } from '@models/tournament_series';
import { Player, IPlayer } from '@models/player';

describe('TournamentSeriesElo model test', () => {
  let tournament_series: TournamentSeries | null;
  let player: Player | null;
  let tournamentSeriesElo: ITournamentSeriesElo;

  beforeEach(async () => {
    // fake a tournament_series
    [tournament_series] = await TournamentSeries.create([
      {
        name: 'TournamentSeries 1',
        tournaments: [new Types.ObjectId()],
      },
    ] as Array<ITournamentSeries>);

    // fake a player
    [player] = await Player.create([
      {
        handle: 'xXx_Ep1c-G4m3r_xXx',
      },
    ] as Array<IPlayer>);

    tournamentSeriesElo = {
      tournament_series: tournament_series?._id,
      player: player?._id,
      score: 1000,
    };
  });

  it('should create & save tournamentSeriesElo successfully', async () => {
    const input = new TournamentSeriesElo(tournamentSeriesElo);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.player.toString()).toBe(
      tournamentSeriesElo.player.toString(),
    );
    expect(output.player.toString()).toBe(player?._id.toString());
    expect(output.tournament_series.toString()).toBe(
      tournamentSeriesElo.tournament_series.toString(),
    );
    expect(output.tournament_series.toString()).toBe(
      tournament_series?._id.toString(),
    );
    expect(output.score).toBe(tournamentSeriesElo.score);

    // should not populate virtuals
    expect(output._tournament_series).toBeUndefined();
    expect(output._player).toBeUndefined();
  });

  it('should populate tournament_series', async () => {
    const input = await new TournamentSeriesElo(tournamentSeriesElo).save();
    const output = await TournamentSeriesElo.findById(input.id).populate(
      '_tournament_series',
    );
    expect(output?._tournament_series).toBeDefined();
    expect(output?._tournament_series?.id).toBe(tournament_series?.id);
    expect(output?._player).toBeUndefined();
  });

  it('should populate player', async () => {
    const input = await new TournamentSeriesElo(tournamentSeriesElo).save();
    const output = await TournamentSeriesElo.findById(input.id).populate(
      '_player',
    );
    expect(output?._tournament_series).toBeUndefined();
    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(player?.id);
  });

  it('should populate tournament_series and player', async () => {
    const input = await new TournamentSeriesElo(tournamentSeriesElo).save();
    const output = await TournamentSeriesElo.findById(input.id)
      .populate('_tournament_series')
      .populate('_player');
    expect(output?._tournament_series).toBeDefined();
    expect(output?._tournament_series?.id).toBe(tournament_series?.id);
    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(player?.id);
  });
});
