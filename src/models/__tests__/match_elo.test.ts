import { DocumentType, isDocument } from '@typegoose/typegoose';
import { MatchElo, MatchEloClass } from '@models/match_elo';
import { Match, MatchClass } from '@models/match';
import { Player, PlayerClass } from '@models/player';
import { Types } from 'mongoose';

describe('MatchElo model test', () => {
  let match: DocumentType<MatchClass>;
  let player: DocumentType<PlayerClass>;
  let matchElo: MatchEloClass;

  beforeEach(async () => {
    // fake a match
    [match] = await Match.create([
      {
        tournament: new Types.ObjectId(),
      },
    ] as Array<MatchClass>);
    [player] = await Player.create([
      {
        handle: 'LAD',
      },
    ] as Array<PlayerClass>);

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

    // shouldn't populate virtuals
    expect(isDocument(output?.match)).toBe(false);
    expect(isDocument(output?.player)).toBe(false);

    expect(output.player?.toString()).toBe(matchElo.player?.toString());
    expect(output.player?.toString()).toBe(player?._id.toString());
    expect(output.match?.toString()).toBe(matchElo.match?.toString());
    expect(output.match?.toString()).toBe(match?._id.toString());
    expect(output.before).toBe(matchElo.before);
    expect(output.after).toBe(matchElo.after);
  });

  it('should populate match', async () => {
    const input = await new MatchElo(matchElo).save();
    const output = await MatchElo.findById(input?.id).populate('match');

    expect(isDocument(output?.match)).toBe(true);
    expect(isDocument(output?.player)).toBe(false);
    if (isDocument(output?.match)) {
      expect(output?.match.id).toBe(match.id);
    }
  });

  it('should populate match', async () => {
    const input = await new MatchElo(matchElo).save();
    const output = await MatchElo.findById(input?.id).populate('player');

    expect(isDocument(output?.match)).toBe(false);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player.id).toBe(player.id);
    }
  });

  it('should populate match and player', async () => {
    const input = await new MatchElo(matchElo).save();
    const output = await MatchElo.findById(input?.id)
      .populate('match')
      .populate('player');

    expect(isDocument(output?.match)).toBe(true);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.match) && isDocument(output?.player)) {
      expect(output?.match.id).toBe(match.id);
      expect(output?.player.id).toBe(player.id);
    }
  });
});
