const path = require('path');

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = ['./src/index.ts'];

    config.resolve = {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@graphql': path.join(__dirname, 'src/graphql'),
        '@lib': path.join(__dirname, 'src/lib'),
        '@models': path.join(__dirname, 'src/models'),
      },
    };

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
    });

    // disable minimize to preserve classnames in prod
    config.optimization.minimize = false;

    return config;
  },
};
