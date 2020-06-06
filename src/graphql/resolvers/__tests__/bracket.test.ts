import { DocumentType } from '@typegoose/typegoose';
import { Tournament, TournamentModel } from '@models/tournament';
import {
  BracketPlatform,
  BracketPlatformModel,
} from '@models/bracket_platform';
import { Bracket, BracketModel } from '@models/bracket';
import {
  generateTournament,
  generateBracketPlatform,
  generateBracket,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';

describe('Bracket GraphQL Resolver Test', () => {
  let tournaments: Array<DocumentType<Tournament>>;
  let platforms: Array<DocumentType<BracketPlatform>>;
  let brackets: Array<DocumentType<Bracket>>;

  beforeEach(async () => {
    tournaments = await TournamentModel.create(
      Array.from(
        {
          length: 4,
        },
        () =>
          generateTournament(
            new ObjectId(),
            [new ObjectId()],
            [new ObjectId()],
            true,
          ),
      ),
    );

    platforms = await BracketPlatformModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateBracketPlatform(true),
      ),
    );

    brackets = await BracketModel.create(
      tournaments.map((t, i) =>
        generateBracket(t._id, platforms[i % platforms.length]._id, i !== 0),
      ),
    );
  });

  it('should return a list of brackets with all field', async () => {
    const source = gql`
      query QueryBrackets {
        brackets {
          _id
          bracket_platform_id
          tournament_id
          url
          slug
          image
          platform_id
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    expect(
      every(
        output.data?.brackets,
        (e) =>
          some(brackets, (s) => s.id === e._id) &&
          some(brackets, (s) => s.tournament?.toString() === e.tournament_id) &&
          some(
            brackets,
            (s) => s.platform?.toString() === e.bracket_platform_id,
          ) &&
          some(brackets, (s) => s.platform_id === e.platform_id) &&
          some(brackets, (s) => (s.url ?? null) === e.url) &&
          some(brackets, (s) => (s.slug ?? null) === e.slug) &&
          some(brackets, (s) => (s.image ?? null) === e.image),
      ),
    ).toBe(true);
  });

  it('should return single bracket by id with all field', async () => {
    const source = gql`
      query QueryBrackets($id: ObjectId!) {
        bracket(id: $id) {
          _id
          bracket_platform_id
          tournament_id
          url
          slug
          image
          platform_id
        }
      }
    `;

    const variableValues = {
      id: brackets[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeDefined();
    expect(output.data?.bracket._id).toBe(brackets[0].id);
    expect(output.data?.bracket.bracket_platform_id).toBe(
      brackets[0].platform?.toString(),
    );
    expect(output.data?.bracket.bracket_platform_id).toBe(platforms[0].id);
    expect(output.data?.bracket.tournament_id).toBe(
      brackets[0].tournament?.toString(),
    );
    expect(output.data?.bracket.tournament_id).toBe(tournaments[0].id);
    expect(output.data?.bracket.url).toBe(brackets[0].url);
    expect(output.data?.bracket.slug).toBe(brackets[0].slug);
    expect(output.data?.bracket.image).toBe(brackets[0].image);
    expect(output.data?.bracket.platform_id).toBe(brackets[0].platform_id);
  });

  it('should return null if not found by id', async () => {
    const source = gql`
      query QueryBrackets($id: ObjectId!) {
        bracket(id: $id) {
          _id
          bracket_platform_id
          tournament_id
          url
          slug
          image
          platform_id
        }
      }
    `;

    const variableValues = {
      id: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeNull();
  });

  it('should return bracket by tournament id', async () => {
    const source = gql`
      query QueryBrackets($tournament: ObjectId!) {
        bracket(tournament: $tournament) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournament: tournaments[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeDefined();
    expect(output.data?.bracket._id).toBe(brackets[1].id);
    expect(output.data?.bracket.tournament_id).toBe(
      brackets[1].tournament?.toString(),
    );
    expect(output.data?.bracket.tournament_id).toBe(tournaments[1].id);
  });

  it('should return null if not found by tournament id', async () => {
    const source = gql`
      query QueryBrackets($tournament: ObjectId!) {
        bracket(tournament: $tournament) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournament: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeNull();
  });

  it('should return bracket by id and tournament', async () => {
    const source = gql`
      query QueryBrackets($tournament: ObjectId!, $id: ObjectId!) {
        bracket(tournament: $tournament, id: $id) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournament: tournaments[1].id,
      id: brackets[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeDefined();
    expect(output.data?.bracket._id).toBe(brackets[1].id);
    expect(output.data?.bracket.tournament_id).toBe(
      brackets[1].tournament?.toString(),
    );
    expect(output.data?.bracket.tournament_id).toBe(tournaments[1].id);
  });

  it('should return null if not found for id and tournament', async () => {
    const source = gql`
      query QueryBrackets($tournament: ObjectId!, $id: ObjectId!) {
        bracket(tournament: $tournament, id: $id) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournament: new ObjectId().toHexString(),
      id: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeNull();
  });

  it('should return null if id or tournament not specified in variables', async () => {
    const source = gql`
      query QueryBrackets {
        bracket {
          _id
          tournament_id
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeNull();
  });

  it('should populate bracket platform for a given bracket', async () => {
    const source = gql`
      query QueryBrackets($id: ObjectId!) {
        bracket(id: $id) {
          _id
          bracket_platform {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: brackets[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeDefined();
    expect(output.data?.bracket._id).toBe(brackets[0].id);
    expect(output.data?.bracket.bracket_platform._id).toBe(
      brackets[0].platform?.toString(),
    );
    expect(output.data?.bracket.bracket_platform._id).toBe(platforms[0].id);
    expect(output.data?.bracket.bracket_platform.name).toBe(platforms[0].name);
  });

  it('should populate tournament for a given bracket', async () => {
    const source = gql`
      query QueryBrackets($id: ObjectId!) {
        bracket(id: $id) {
          _id
          tournament {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: brackets[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket).toBeDefined();
    expect(output.data?.bracket._id).toBe(brackets[0].id);
    expect(output.data?.bracket.tournament._id).toBe(
      brackets[0].tournament?.toString(),
    );
    expect(output.data?.bracket.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.bracket.tournament.name).toBe(tournaments[0].name);
  });

  it('should sort brackets by bracket platform id', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: BRACKET_PLATFORM_ID) {
          _id
          bracket_platform_id
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.platform?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map(
      (d) => d.bracket_platform_id,
    );

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort brackets by tournament id', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: TOURNAMENT_ID) {
          _id
          tournament_id
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.tournament?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map((d) => d.tournament_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort brackets by platform id asc', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: PLATFORM_ID_ASC) {
          _id
          platform_id
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.platform_id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map((d) => d.platform_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort brackets by platform id desc', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: PLATFORM_ID_DESC) {
          _id
          platform_id
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.platform_id),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map((d) => d.platform_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort brackets by slug asc', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: SLUG_ASC) {
          _id
          slug
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.slug ?? null),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map((d) => d.slug);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort brackets by slug desc', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: SLUG_DESC) {
          _id
          slug
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.slug ?? null),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map((d) => d.slug);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort brackets by id', async () => {
    const source = gql`
      query QueryBrackets {
        brackets(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      brackets.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);

    const dataFromQuery: Array<any> = output.data?.brackets;
    const received: Array<string> = dataFromQuery.map((d) => d._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should get brackets by list of ids', async () => {
    const source = gql`
      query QueryBrackets($ids: [ObjectId!]) {
        brackets(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: brackets.map((b) => b.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(brackets.length);
  });

  it('should return empty array if not found for list of ids', async () => {
    const source = gql`
      query QueryBrackets($ids: [ObjectId!]) {
        brackets(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(0);
  });

  it('should get brackets for a list of tournaments', async () => {
    const source = gql`
      query QueryBrackets($tournaments: [ObjectId!]) {
        brackets(tournaments: $tournaments) {
          _id
        }
      }
    `;

    const variableValues = {
      tournaments: tournaments.map((b) => b.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(tournaments.length);
  });

  it('should return empty array if not found for a list of tournaments', async () => {
    const source = gql`
      query QueryBrackets($tournaments: [ObjectId!]) {
        brackets(tournaments: $tournaments) {
          _id
        }
      }
    `;

    const variableValues = {
      tournaments: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(0);
  });

  it('should get brackets for a bracket platform', async () => {
    const source = gql`
      query QueryBrackets($bracket_platform: ObjectId!) {
        brackets(bracket_platform: $bracket_platform) {
          _id
        }
      }
    `;

    const variableValues = {
      bracket_platform: platforms[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(
      brackets.filter((b) => b.platform?.toString() === platforms[0].id).length,
    );
  });

  it('should return empty array if not found for a bracket platform', async () => {
    const source = gql`
      query QueryBrackets($bracket_platform: ObjectId!) {
        brackets(bracket_platform: $bracket_platform) {
          _id
        }
      }
    `;

    const variableValues = {
      bracket_platform: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(0);
  });

  it('should return brackets when searching by slug', async () => {
    const source = gql`
      query QueryBrackets($slug: String!) {
        brackets(slug: $slug) {
          _id
        }
      }
    `;

    const variableValues = {
      slug: brackets[0].slug?.toUpperCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(1);
  });

  it('should return empty array if search by slug returns no results', async () => {
    const source = gql`
      query QueryBrackets($slug: String!) {
        brackets(slug: $slug) {
          _id
        }
      }
    `;

    const variableValues = {
      slug: 'hafoihfuaihuioqghuqiogfiuqgfiug',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(0);
  });

  it('should return brackets when searching by platform id', async () => {
    const source = gql`
      query QueryBrackets($platform_id: String!) {
        brackets(platform_id: $platform_id) {
          _id
        }
      }
    `;

    const variableValues = {
      platform_id: brackets[0].platform_id.toUpperCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(1);
  });

  it('should return empty array if search by platform id returns no results', async () => {
    const source = gql`
      query QueryBrackets($platform_id: String!) {
        brackets(platform_id: $platform_id) {
          _id
        }
      }
    `;

    const variableValues = {
      platform_id: 'hafoihfuaihuioqghuqiogfiuqgfiug',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.brackets).toBeDefined();
    expect(output.data?.brackets).toHaveLength(0);
  });
});
