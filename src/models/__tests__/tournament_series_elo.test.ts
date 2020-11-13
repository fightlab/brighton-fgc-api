import { Types } from 'mongoose';
import { DocumentType, isDocument } from '@typegoose/typegoose';
import {
  TournamentSeriesEloModel,
  TournamentSeriesElo,
} from '@models/tournament_series_elo';
import {
  TournamentSeriesModel,
  TournamentSeries,
} from '@models/tournament_series';
import { PlayerModel, Player } from '@models/player';

describe('TournamentSeriesElo model test', () => {
  let tournament_series: DocumentType<TournamentSeries>;
  let player: DocumentType<Player>;
  let tournamentSeriesElo: TournamentSeriesElo;

  beforeEach(async () => {
    // fake a tournament_series
    [tournament_series] = await TournamentSeriesModel.create([
      {
        name: 'TournamentSeries 1',
        tournaments: [new Types.ObjectId()],
      },
    ] as Array<TournamentSeries>);

    // fake a player
    [player] = await PlayerModel.create([
      {
        handle: 'xXx_Ep1c-G4m3r_xXx',
      },
    ] as Array<Player>);

    tournamentSeriesElo = {
      tournament_series: tournament_series?._id,
      player: player?._id,
      score: 1000,
    };
  });

  it('should create & save tournamentSeriesElo successfully', async () => {
    const input = new TournamentSeriesEloModel(tournamentSeriesElo);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.player?.toString()).toBe(
      tournamentSeriesElo.player?.toString(),
    );
    expect(output.player?.toString()).toBe(player?._id.toString());
    expect(output.tournament_series?.toString()).toBe(
      tournamentSeriesElo.tournament_series?.toString(),
    );
    expect(output.tournament_series?.toString()).toBe(
      tournament_series?._id.toString(),
    );
    expect(output.score).toBe(tournamentSeriesElo.score);
  });

  it('should populate tournament_series', async () => {
    const input = await new TournamentSeriesEloModel(
      tournamentSeriesElo,
    ).save();
    const output = await TournamentSeriesEloModel.findById(input.id).populate(
      'tournament_series',
    );

    expect(isDocument(output?.tournament_series)).toBe(true);
    expect(isDocument(output?.player)).toBe(false);
    if (isDocument(output?.tournament_series)) {
      expect(output?.tournament_series?.id).toBe(tournament_series?.id);
    }
  });

  it('should populate player', async () => {
    const input = await new TournamentSeriesEloModel(
      tournamentSeriesElo,
    ).save();
    const output = await TournamentSeriesEloModel.findById(input.id).populate(
      'player',
    );

    expect(isDocument(output?.tournament_series)).toBe(false);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player?.id).toBe(player?.id);
    }
  });

  it('should populate tournament_series and player', async () => {
    const input = await new TournamentSeriesEloModel(
      tournamentSeriesElo,
    ).save();
    const output = await TournamentSeriesEloModel.findById(input.id)
      .populate('tournament_series')
      .populate('player');

    expect(isDocument(output?.tournament_series)).toBe(true);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.tournament_series) && isDocument(output?.player)) {
      expect(output?.tournament_series?.id).toBe(tournament_series?.id);
      expect(output?.player?.id).toBe(player?.id);
    }
  });
});
