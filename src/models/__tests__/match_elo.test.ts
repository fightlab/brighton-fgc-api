import { DocumentType, isDocument } from '@typegoose/typegoose';
import { MatchEloModel, MatchElo } from '@models/match_elo';
import { MatchModel, Match } from '@models/match';
import { PlayerModel, Player } from '@models/player';
import { CreateQuery, Types } from 'mongoose';

describe('MatchElo model test', () => {
  let match: DocumentType<Match>;
  let player: DocumentType<Player>;
  let matchElo: MatchElo;

  beforeEach(async () => {
    // fake a match
    [match] = await MatchModel.create([
      {
        tournament: new Types.ObjectId(),
      },
    ] as CreateQuery<Match>[]);
    [player] = await PlayerModel.create([
      {
        handle: 'LAD',
      },
    ] as Array<Player>);

    matchElo = {
      match: match?._id,
      player: player?._id,
      before: 1000,
      after: 1100,
    };
  });

  it('should create & save matchElo successfully', async () => {
    const input = new MatchEloModel(matchElo);
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
    const input = await new MatchEloModel(matchElo).save();
    const output = await MatchEloModel.findById(input?.id).populate('match');

    expect(isDocument(output?.match)).toBe(true);
    expect(isDocument(output?.player)).toBe(false);
    if (isDocument(output?.match)) {
      expect(output?.match.id).toBe(match.id);
    }
  });

  it('should populate match', async () => {
    const input = await new MatchEloModel(matchElo).save();
    const output = await MatchEloModel.findById(input?.id).populate('player');

    expect(isDocument(output?.match)).toBe(false);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player.id).toBe(player.id);
    }
  });

  it('should populate match and player', async () => {
    const input = await new MatchEloModel(matchElo).save();
    const output = await MatchEloModel.findById(input?.id)
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
