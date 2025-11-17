/**
 * webpack configuration for ghard13 library
 * context: build system setup for library bundling
 * impact: enables development and production builds
 */

const path = require('path');

module.exports = {
  entry: './src/ghard13.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'ghard13.js',
    library: 'ghard13',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};