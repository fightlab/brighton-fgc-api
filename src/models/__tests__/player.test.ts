import { PlayerModel, Player } from '@models/player';

describe('Player model test', () => {
  const playerFull: Player = {
    handle: 'Player 1',
    icon: 'https://hbk.gg/p1.jpg',
    team: 'HBK',
    is_staff: true,
  };

  const playerMin: Player = {
    handle: 'Player 2',
  };

  it('create & save Player successfully', async () => {
    const input = new PlayerModel(playerFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.handle).toBe(playerFull.handle);
    expect(output.icon).toBe(playerFull.icon);
    expect(output.team).toBe(playerFull.team);
    expect(output.is_staff).toBe(playerFull.is_staff);
  });

  it('create & save minimum Player successfully', async () => {
    const input = new PlayerModel(playerMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.handle).toBe(playerMin.handle);
    expect(output.icon).toBeUndefined();
    expect(output.team).toBeUndefined();
    expect(output.is_staff).toBe(false);
  });
});
