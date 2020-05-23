import { VodPlatform, VodPlatformClass } from '@models/vod_platform';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('VodPlatform model test', () => {
  const vodPlatformFull: VodPlatformClass = {
    name: 'VodPlatform #1',
    url: 'https://hbk.gg',
    watch_url: 'https://hbk.gg/watch/',
    embed_url: 'https://hbk.gg/embed/',
  };

  const vodPlatformMin: VodPlatformClass = {
    name: 'VodPlatform #2',
    url: 'https://hbk.gg',
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

  it('should not validate if url not valid', async () => {
    const input = new VodPlatform({
      ...vodPlatformFull,
      url: 'not-valid-url',
    });

    input.validate((error) => {
      expect(error.errors.url.message).toBe(
        generateValidationMessage(
          'url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if url not correct type', async () => {
    const input = new VodPlatform({
      ...vodPlatformFull,
      url: 1993,
    });

    input.validate((error) => {
      expect(error.errors.url.message).toBe(
        generateValidationMessage(
          'url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if watch_url not valid', async () => {
    const input = new VodPlatform({
      ...vodPlatformFull,
      watch_url: 'not-valid-watch_url',
    });

    input.validate((error) => {
      expect(error.errors.watch_url.message).toBe(
        generateValidationMessage(
          'watch_url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if watch_url not correct type', async () => {
    const input = new VodPlatform({
      ...vodPlatformFull,
      watch_url: 1993,
    });

    input.validate((error) => {
      expect(error.errors.watch_url.message).toBe(
        generateValidationMessage(
          'watch_url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if embed_url not valid', async () => {
    const input = new VodPlatform({
      ...vodPlatformFull,
      embed_url: 'not-valid-embed_url',
    });

    input.validate((error) => {
      expect(error.errors.embed_url.message).toBe(
        generateValidationMessage(
          'embed_url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if embed_url not correct type', async () => {
    const input = new VodPlatform({
      ...vodPlatformFull,
      embed_url: 1993,
    });

    input.validate((error) => {
      expect(error.errors.embed_url.message).toBe(
        generateValidationMessage(
          'embed_url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });
});
