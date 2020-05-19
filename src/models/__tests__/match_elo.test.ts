import { MatchElo, IMatchElo } from '@models/match_elo';
import { Match, IMatch } from '@models/match';
import { Player, IPlayer } from '@models/player';
import { Types } from 'mongoose';

describe('MatchElo model test', () => {
  let match: Match | null;
  let player: Player | null;
  let matchElo: IMatchElo;

  beforeEach(async () => {
    // fake a match
    [match] = await Match.create([
      {
        tournament: new Types.ObjectId(),
      },
    ] as Array<IMatch>);
    [player] = await Player.create([
      {
        handle: 'LAD',
      },
    ] as Array<IPlayer>);

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
    const input = await new MatchElo(matchElo).save();
    const output = await MatchElo.findById(input?.id).populate('_match');
    expect(output?._match).toBeDefined();
    expect(output?._match?.id).toBe(match?.id);
    expect(output?._player).toBeUndefined();
  });

  it('should populate match', async () => {
    const input = await new MatchElo(matchElo).save();
    const output = await MatchElo.findById(input?.id).populate('_player');
    expect(output?._match).toBeUndefined();
    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(player?.id);
  });

  it('should populate match and player', async () => {
    const input = await new MatchElo(matchElo).save();
    const output = await MatchElo.findById(input?.id)
      .populate('_match')
      .populate('_player');
    expect(output?._match).toBeDefined();
    expect(output?._match?.id).toBe(match?.id);
    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(player?.id);
  });
});
