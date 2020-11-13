const path = require('path');

module.exports = {
  webpack: (config, options, webpack) => {
    // entry file
    config.entry.main = ['./src/index.ts'];

    config.resolve = {
      // extensions to parse
      extensions: ['.ts', '.js', '.json'],
      // alias for folders, need to add to tsconfig.json + jest.config.js
      // as well for aliases to work in all places
      alias: {
        '@graphql': path.join(__dirname, 'src/graphql'),
        '@lib': path.join(__dirname, 'src/lib'),
        '@models': path.join(__dirname, 'src/models'),
      },
    };

    // we're doing typescript
    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
    });

    // disable minimize to preserve classnames in prod, otherwise
    // graphql types go funny, this is ok as we're running a server
    // and don't need minimization
    config.optimization.minimize = false;

    return config;
  },
};
