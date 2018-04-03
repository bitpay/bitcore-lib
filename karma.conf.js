'use strict';
var path = require('path')

var src = './index.js',
    tests = './test.spec.js';

var karmaConfig = {
  frameworks: ['mocha', 'chai'],
  files: [
    src,
    tests
  ],
  preprocessors: {},
  webpack: {
    node: {
      fs: 'empty',
    },
    module: {
      rules: [
        { test: /\.json$/, use: "json-loader" },
        { test: /\.dat$/, use: "raw-loader" },
        { enforce:'post', loader: "transform-loader?brfs" },
      ],
    },
  },
  reporters: ['mocha'],
  port: 9876,
  colors: true,
  autoWatch: false,
  browsers: ['Chrome', 'Firefox'],
  singleRun: false,
  concurrency: Infinity,
  plugins: [
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-webpack'
  ]
};
karmaConfig.preprocessors[src] = ['webpack'];
karmaConfig.preprocessors[tests] = ['webpack'];

// karma.conf.js
module.exports = function(config) {
  config.set(karmaConfig);
};
