import { Venue, IVenue } from '@models/venue';

describe('Venue model test', () => {
  const venueFull: IVenue = {
    name: 'Venue #1',
    short: 'v1',
    address: 'V1, 1 Venue Street, Venue City, V3 9UE',
    google_maps: 'https://maps.google.com/some-slug',
    website: 'https://some-web-address.co.uk',
  };

  const venueMin: IVenue = {
    name: 'Venue #2',
    short: 'v2',
  };

  it('create & save venue successfully', async () => {
    const input = new Venue(venueFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(venueFull.name);
    expect(output.website).toBe(venueFull.website);
    expect(output.short).toBe(venueFull.short);
    expect(output.address).toBe(venueFull.address);
    expect(output.google_maps).toBe(venueFull.google_maps);
  });

  it('create & save minimum venue successfully', async () => {
    const input = new Venue(venueMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(venueMin.name);
    expect(output.short).toBe(venueMin.short);
    expect(output.website).toBeUndefined();
    expect(output.address).toBeUndefined();
    expect(output.google_maps).toBeUndefined();
  });
});
