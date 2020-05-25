import { BracketPlatformResolver } from '@graphql/resolvers/bracket_platform';
import { GameResolver } from '@graphql/resolvers/game';

// add all resolvers here
export const resolvers: [Function, ...Function[]] = [
  BracketPlatformResolver,
  GameResolver,
];
