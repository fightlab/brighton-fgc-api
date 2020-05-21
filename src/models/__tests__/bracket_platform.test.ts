import { BracketPlatform, IBracketPlatform } from '@models/bracket_platform';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@/lib/validation';

describe('BracketPlatform model test', () => {
  const bracketPlatformFull: IBracketPlatform = {
    name: 'Habrewken Tournaments',
    url: 'https://hbk.gg',
    api_docs: 'https://github.com/fightlab/brighton-fgc-api',
    api_url: 'https://api.hbk.gg',
    meta: {
      random: 'stuff',
    },
  };

  const bracketPlatformMin: IBracketPlatform = {
    name: 'Pen and Paper',
  };

  it('create & save bracketPlatform successfully', async () => {
    const input = new BracketPlatform(bracketPlatformFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(bracketPlatformFull.name);
    expect(output.url).toBe(bracketPlatformFull.url);
    expect(output.api_docs).toBe(bracketPlatformFull.api_docs);
    expect(output.api_url).toBe(bracketPlatformFull.api_url);
    expect(output.meta).toBeDefined();
  });

  it('create & save minimum bracketPlatform successfully', async () => {
    const input = new BracketPlatform(bracketPlatformMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(bracketPlatformMin.name);
    expect(output.url).toBeUndefined();
    expect(output.api_docs).toBeUndefined();
    expect(output.api_url).toBeUndefined();
    expect(output.meta).toBeUndefined();
  });

  it('should not validate if url not valid', async () => {
    const input = new BracketPlatform({
      ...bracketPlatformFull,
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
    const input = new BracketPlatform({
      ...bracketPlatformFull,
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

  it('should not validate if api url not valid', async () => {
    const input = new BracketPlatform({
      ...bracketPlatformFull,
      api_url: 'not-valid-url',
    });

    input.validate((error) => {
      expect(error.errors.api_url.message).toBe(
        generateValidationMessage(
          'api_url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if api url not correct type', async () => {
    const input = new BracketPlatform({
      ...bracketPlatformFull,
      api_url: 1993,
    });

    input.validate((error) => {
      expect(error.errors.api_url.message).toBe(
        generateValidationMessage(
          'api_url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if api_docs not valid', async () => {
    const input = new BracketPlatform({
      ...bracketPlatformFull,
      api_docs: 'not-valid-api_docs',
    });

    input.validate((error) => {
      expect(error.errors.api_docs.message).toBe(
        generateValidationMessage(
          'api_docs',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if api_docs not correct type', async () => {
    const input = new BracketPlatform({
      ...bracketPlatformFull,
      api_docs: 1993,
    });

    input.validate((error) => {
      expect(error.errors.api_docs.message).toBe(
        generateValidationMessage(
          'api_docs',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });
});
