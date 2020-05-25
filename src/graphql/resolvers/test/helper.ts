import { graphql, Source, GraphQLSchema } from 'graphql';
import { createSchema } from '@lib/graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { loaders } from '@graphql/loaders';
import { Context } from '@lib/graphql';

interface GqlCallOptions {
  source: string | Source;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
}

// cache the schema so we don't need to generate it each test
let schema: GraphQLSchema;

// helper method to call graphql without needing an server
export const gqlCall = async ({ source, variableValues }: GqlCallOptions) => {
  if (!schema) {
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      loaders,
    } as Context,
  });
};
