import { BracketPlatform, IBracketPlatform } from '@models/bracket_platform';

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
});
