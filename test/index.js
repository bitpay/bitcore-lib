"use strict";

var should = require("chai").should();
var bitcore = require("../");

describe('#versionGuard', function() {
  it('global._bitcore should be defined', function() {
    should.equal(global._bitcore, bitcore.version);
  });
});
