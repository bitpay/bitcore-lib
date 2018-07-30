var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../../index');

var CoinbasePayload = DashcoreLib.Transaction.SpecialTransactions.payload.CoinbasePayload;

var merkleRootMNList = 'e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
console.log(merkleRootMNList);

var validCoinbasePayloadJSON = {
  nVersion: 10,
  height: 20,
  merkleRootMNList: merkleRootMNList
};
// Contains same data as JSON above
// 0a00 is 16-bit unsigned 10, 14000000 is 32 bit unsigned 20, everything else is a hash.
var validCoinbasePayloadHexString = '0a0014000000e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
var validCoinbasePayloadBuffer = Buffer.from(validCoinbasePayloadHexString, 'hex');
var validCoinbasePayload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);

describe('CoinbasePayload', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    afterEach(function () {
      CoinbasePayload.prototype.validate.restore();
    });

    it('Should return instance of CoinbasePayload and call #validate on it', function() {
      var payload = CoinbasePayload.fromBuffer(validCoinbasePayloadBuffer);

      expect(payload).to.be.an.instanceOf(CoinbasePayload);
      expect(payload.nVersion).to.be.equal(10);
      expect(payload.height).to.be.equal(20);
      expect(payload.merkleRootMNList).to.be.equal(merkleRootMNList);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validCoinbasePayloadHexString + '0000', 'hex');

      expect(function() {
        CoinbasePayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    it('Should return instance of CoinbasePayload and call #validate on it', function() {
      var payload = CoinbasePayload.fromBuffer(validCoinbasePayloadBuffer);

      expect(payload).to.be.an.instanceOf(CoinbasePayload);
      expect(payload.nVersion).to.be.equal(10);
      expect(payload.height).to.be.equal(20);
      expect(payload.merkleRootMNList).to.be.equal(merkleRootMNList);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    after(function () {
      CoinbasePayload.prototype.validate.restore();
    })
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as nVersion', function () {
      var payload = validCoinbasePayload.copy();

      payload.nVersion = -1;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect nVersion to be an unsigned integer');

      payload.nVersion = 1.5;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect nVersion to be an unsigned integer');

      payload.nVersion = '12';

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect nVersion to be an unsigned integer');

      payload.nVersion = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect nVersion to be an unsigned integer');

      payload.nVersion = 123;

      expect(function () {
        payload.validate()
      }).not.to.throw;
    });
    it('Should allow only unsigned integer as height', function () {
      var payload = validCoinbasePayload.copy();

      payload.height = -1;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = 1.5;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = '12';

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = 123;

      expect(function () {
        payload.validate()
      }).not.to.throw;
    });
    it('Should allow only sha256 hash as merkleRootMNList', function () {
      var payload = validCoinbasePayload.copy();

      payload.merkleRootMNList = -1;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: expect merkleRootMNList to be a hex string');

      payload.merkleRootMNList = 1.5;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: expect merkleRootMNList to be a hex string');

      payload.merkleRootMNList = '12';

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Invalid merkleRootMNList size');

      payload.merkleRootMNList = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: expect merkleRootMNList to be a hex string');

      payload.merkleRootMNList = merkleRootMNList;

      expect(function () {
        payload.validate()
      }).not.to.throw;
    });
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    afterEach(function () {
      CoinbasePayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validCoinbasePayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.nVersion).to.be.equal(payload.nVersion);
      expect(payloadJSON.height).to.be.equal(payload.height);
      expect(payloadJSON.merkleRootMNList).to.be.equal(payload.merkleRootMNList);
    });
    it('Should call #validate', function () {
      var payload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);
      CoinbasePayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    afterEach(function () {
      CoinbasePayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validCoinbasePayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = CoinbasePayload.fromBuffer(serializedPayload);

      expect(restoredPayload.nVersion).to.be.equal(payload.nVersion);
      expect(restoredPayload.height).to.be.equal(payload.height);
      expect(restoredPayload.merkleRootMNList).to.be.equal(payload.merkleRootMNList);
    });
    it('Should call #validate', function () {
      var payload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);
      CoinbasePayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});