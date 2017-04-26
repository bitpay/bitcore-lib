'use strict';

var should = require('chai').should();
var digibyte = require('../');

describe('#versionGuard', function() {
  it('global._digibyte should be defined', function() {
    should.equal(global._digibyte, digibyte.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      digibyte.versionGuard('version');
    }).should.throw('More than one instance of digibyte');
  });
});
