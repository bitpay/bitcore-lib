const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const commonJSConfig = {
  module: {
    rules: [],
  },


};

const rawConfig = Object.assign({}, commonJSConfig, {
  entry: ['./index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bitcore-lib-dash.js',
    library: 'bitcore-lib-dash',
    libraryTarget: 'umd',
  }
})
const uglifiedConfig = Object.assign({}, commonJSConfig, {
  entry: ['./dist/bitcore-lib-dash.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bitcore-lib-dash.min.js',
    library: 'bitcore-lib-dash',
    libraryTarget: 'umd',
  },
  plugins: [
    new UglifyJsPlugin()
  ]
})

module.exports = [rawConfig, uglifiedConfig];