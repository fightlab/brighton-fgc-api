import { graphql, Source, GraphQLSchema, ExecutionResult } from 'graphql';
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
export const gqlCall = async ({
  source,
  variableValues,
}: GqlCallOptions): Promise<ExecutionResult> => {
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

// function which just returns the template literal, used for syntax highlighting
const highlight = (s: TemplateStringsArray, ...args: any[]): string =>
  s.map((ss, i) => `${ss}${args[i] || ''}`).join('');

// gql tag for gql syntax highlighting
export const gql = highlight;
