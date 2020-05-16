const path = require('path');

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = ['./src/index.ts'];

    config.resolve = {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@': path.join(__dirname, 'src'),
        '@models': path.join(__dirname, 'src/models'),
        '@lib': path.join(__dirname, 'src/lib'),
      },
    };

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
    });

    return config;
  },
};
