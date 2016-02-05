'use strict';
var getRandomBytes = require('randombytes');

function Random() {
}

/* secure random bytes that sometimes throws an error due to lack of entropy */
Random.getRandomBuffer = function(size) {
  return getRandomBytes(size);
};

Random.getRandomBufferNode = function(size) {
  return this.getRandomBuffer(size);
};

Random.getRandomBufferBrowser = function(size) {
  return this.getRandomBuffer(size);
};

/* insecure random bytes, but it never fails */
Random.getPseudoRandomBuffer = function(size) {
  var b32 = 0x100000000;
  var b = new Buffer(size);
  var r;

  for (var i = 0; i <= size; i++) {
    var j = Math.floor(i / 4);
    var k = i - j * 4;
    if (k === 0) {
      r = Math.random() * b32;
      b[i] = r & 0xff;
    } else {
      b[i] = (r = r >>> 8) & 0xff;
    }
  }

  return b;
};

module.exports = Random;
