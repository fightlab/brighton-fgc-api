import { Player, IPlayer } from '@models/player';

describe('Player model test', () => {
  const PlayerFull: IPlayer = {
    handle: 'Player 1',
    icon: 'https://hbk.gg/p1.jpg',
    team: 'HBK',
    is_staff: true,
  };

  const PlayerMin: IPlayer = {
    handle: 'Player 2',
  };

  it('create & save Player successfully', async () => {
    const input = new Player(PlayerFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.handle).toBe(PlayerFull.handle);
    expect(output.icon).toBe(PlayerFull.icon);
    expect(output.team).toBe(PlayerFull.team);
    expect(output.is_staff).toBe(PlayerFull.is_staff);
  });

  it('create & save minimum Player successfully', async () => {
    const input = new Player(PlayerMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.handle).toBe(PlayerMin.handle);
    expect(output.icon).toBeUndefined();
    expect(output.team).toBeUndefined();
    expect(output.is_staff).toBe(false);
  });
});
