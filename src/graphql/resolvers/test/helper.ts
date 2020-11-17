import { graphql, Source, GraphQLSchema, ExecutionResult } from 'graphql';
import { createSchema } from '@lib/graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import { loaders } from '@graphql/loaders';
import { Context } from '@lib/graphql';
import { User } from '@lib/auth';

interface GqlCallOptions {
  source: string | Source;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
}

// cache the schema so we don't need to generate it each test
let schema: GraphQLSchema;

// helper method to call graphql without needing an server
export const gqlCall = async (
  { source, variableValues }: GqlCallOptions,
  // provide user to test authenticated/authorized routes
  // in production user is provided by express-jwt
  user?: User,
): Promise<ExecutionResult> => {
  if (!schema) {
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      loaders,
      user,
    } as Context,
  });
};

// function which just returns the template literal, used for syntax highlighting
const highlight = (s: TemplateStringsArray, ...args: any[]): string =>
  s.map((ss, i) => `${ss}${args[i] || ''}`).join('');

// gql tag for gql syntax highlighting
export const gql = highlight;
