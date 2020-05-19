import { MatchElo, IMatchElo } from '@models/match_elo';
import { Match } from '@models/match';
import { Player } from '@models/player';

describe('MatchElo model test', () => {
  let match: Match | null;
  let player: Player | null;
  let matchElo: IMatchElo;

  beforeAll(async () => {
    match = await Match.findOne();
    player = await Player.findOne();

    matchElo = {
      match: match?._id,
      player: player?._id,
      before: 1000,
      after: 1100,
    };
  });

  it('should create & save matchElo successfully', async () => {
    const input = new MatchElo(matchElo);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.player.toString()).toBe(matchElo.player.toString());
    expect(output.player.toString()).toBe(player?._id.toString());
    expect(output.match.toString()).toBe(matchElo.match.toString());
    expect(output.match.toString()).toBe(match?._id.toString());
    expect(output.before).toBe(matchElo.before);
    expect(output.after).toBe(matchElo.after);

    // should not populate virtuals
    expect(output._match).toBeUndefined();
    expect(output._player).toBeUndefined();
  });

  it('should populate match', async () => {
    const output = await MatchElo.findOne().populate('_match');
    expect(output?._match).toBeDefined();
    expect(output?._player).toBeUndefined();
  });

  it('should populate match', async () => {
    const output = await MatchElo.findOne().populate('_player');
    expect(output?._match).toBeUndefined();
    expect(output?._player).toBeDefined();
  });

  it('should populate match and player', async () => {
    const output = await MatchElo.findOne()
      .populate('_match')
      .populate('_player');
    expect(output?._match).toBeDefined();
    expect(output?._player).toBeDefined();
  });
});
