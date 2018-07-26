var expect = require('chai').expect;
var HashUtil = require('../../lib/util/hashutil');

describe('hashutil', function () {

  describe('#getRandomHashHexString', function () {

    it('Should return random buffer with 32 byte size', function () {
      var hash1 = HashUtil.getRandomHashHexString();

      expect(hash1).to.be.a.string;
      expect(hash1.length).to.be.equal(64);

      var hash2 = HashUtil.getRandomHashHexString();

      expect(hash2).to.be.a.string;
      expect(hash2.length).to.be.equal(64);

      expect(hash1).to.be.not.equal(hash2);
    });

  })

});