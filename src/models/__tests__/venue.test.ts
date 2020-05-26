import { VenueModel, Venue } from '@models/venue';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

describe('Venue model test', () => {
  const venueFull: Venue = {
    name: 'Venue #1',
    short: 'v1',
    address: 'V1, 1 Venue Street, Venue City, V3 9UE',
    google_maps: 'https://goo.gl/maps/location-slug',
    website: 'https://some-web-address.co.uk',
  };

  const venueMin: Venue = {
    name: 'Venue #2',
    short: 'v2',
  };

  it('create & save venue successfully', async () => {
    const input = new VenueModel(venueFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(venueFull.name);
    expect(output.website).toBe(venueFull.website);
    expect(output.short).toBe(venueFull.short);
    expect(output.address).toBe(venueFull.address);
    expect(output.google_maps).toBe(venueFull.google_maps);
  });

  it('create & save minimum venue successfully', async () => {
    const input = new VenueModel(venueMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(venueMin.name);
    expect(output.short).toBe(venueMin.short);
    expect(output.website).toBeUndefined();
    expect(output.address).toBeUndefined();
    expect(output.google_maps).toBeUndefined();
  });

  it('should not validate if website not valid', async () => {
    const input = new VenueModel({
      ...venueMin,
      website: 'not-valid-website',
    });

    input.validate((error) => {
      expect(error.errors.website.message).toBe(
        generateValidationMessage(
          'website',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if website not correct type', async () => {
    const input = new VenueModel({
      ...venueMin,
      website: 1993,
    });

    input.validate((error) => {
      expect(error.errors.website.message).toBe(
        generateValidationMessage(
          'website',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });
});
