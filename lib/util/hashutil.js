var Hash = require('../crypto/hash');

var HashUtil = {
  getRandomHash: function getRandomHash() {
    return Hash.sha256sha256(Buffer.from(Math.random().toString()));
  }
};

module.exports = HashUtil;