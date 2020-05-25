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

let schema: GraphQLSchema;

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
