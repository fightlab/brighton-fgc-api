import { VodPlatform, IVodPlatform } from '@models/vod_platform';

describe('VodPlatform model test', () => {
  const vodPlatformFull: IVodPlatform = {
    name: 'VodPlatform #1',
    url: 'https://some-web-watch_url.co.uk',
    watch_url: 'https://some-web-watch_url.co.uk/watch/',
    embed_url: 'https://some-web-watch_url.co.uk/embed/',
  };

  const vodPlatformMin: IVodPlatform = {
    name: 'VodPlatform #2',
    url: 'https://some-web-watch_url.co.uk',
  };

  it('create & save vodPlatform successfully', async () => {
    const input = new VodPlatform(vodPlatformFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(vodPlatformFull.name);
    expect(output.url).toBe(vodPlatformFull.url);
    expect(output.watch_url).toBe(vodPlatformFull.watch_url);
    expect(output.embed_url).toBe(vodPlatformFull.embed_url);
  });

  it('create & save minimum vodPlatform successfully', async () => {
    const input = new VodPlatform(vodPlatformMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(vodPlatformMin.name);
    expect(output.url).toBe(vodPlatformMin.url);
    expect(output.watch_url).toBeUndefined();
    expect(output.embed_url).toBeUndefined();
  });
});
