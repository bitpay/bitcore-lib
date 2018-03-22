const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const commonJSConfig = {
  entry: ['./index.js'],
  module: {
    rules: [
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bitcore-lib-dash.js',
    library: 'bitcore-lib-dash',
    libraryTarget: 'umd',
  },
  plugins: [
    new UglifyJsPlugin()
  ]

};

module.exports = [commonJSConfig];