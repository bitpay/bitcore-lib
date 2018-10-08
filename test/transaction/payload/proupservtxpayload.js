var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var ProTxUpServPayload = DashcoreLib.Transaction.Payload.ProTxUpServPayload;

var merkleRootMNList = 'e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
console.log(merkleRootMNList);

var validProTxUpServPayloadJSON = {
  version: 1,
  proTXHash: '0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4',
  port: 1236,
  //address: 'yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb'
  merkleRootMNList: merkleRootMNList
};
var validProTxUpServPayloadHexString = '0300020001a45f4e6af45dfc15d44147ec6e5ab0d8d2048ea2e95e2820f7cdfd1c1b917509000000006b483045022100c78d22ea8df7a17d2491b6be545c577b0659b551e2e75de42ee31cd396e46745022035e6bfa933a5c4d35cd13dc764572f886a9f1139aae61d54881fe3be6407b74c0121022bf34ca08d39eb045fbfda9d5aaedef1f1e16801fe0cfe8375b054e0810f50defeffffff01b30f6eb7060000001976a914e0cd9defb139b9433d481b20dd15bbbb94a1aa0c88ac00000000b40100a45f4e6af45dfc15d44147ec6e5ab0d8d2048ea2e95e2820f7cdfd1c1b9175094312010000000000000000000000ffff0102030604d41976a9148603df234fe8f26064439de60ed13eb92d76cc5588ac8c62104a85a6efb165315d61e1660ee7e25c1831d240c35878053929ba377c88411fdaf84b78552f91c99eb267efec1be0e63b7459e66f142daabb0345477842592b68ce0f59b163657c480061fe834a888f9a9697e7635b36b4ede84a2374ad9831';
var validProTxUpServPayloadBuffer = Buffer.from(validProTxUpServPayloadHexString, 'hex');
var validProTxUpServPayload = ProTxUpServPayload.fromBuffer(validProTxUpServPayloadBuffer);
var validProUpServTxHash = 'a64e3e06c71873aff149c446d76618efad9a5908007886f6024e9fddb3e6aa13';

describe('ProTxUpServPayload', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProTxUpServPayload.prototype.validate.restore();
    });

    it('Should return instance of ProTxUpServPayload and call #validate on it', function() {
      var payload = ProTxUpServPayload.fromBuffer(validProTxUpServPayloadBuffer);

      expect(payload).to.be.an.instanceOf(ProTxUpServPayload);
      expect(payload.version).to.be.equal(10);
      expect(payload.height).to.be.equal(20);
      expect(payload.merkleRootMNList).to.be.equal(merkleRootMNList);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProTxUpServPayloadHexString + '0000', 'hex');

      expect(function() {
        ProTxUpServPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    it('Should return instance of ProTxUpServPayload and call #validate on it', function() {
      var payload = ProTxUpServPayload.fromBuffer(validProTxUpServPayloadBuffer);

      expect(payload).to.be.an.instanceOf(ProTxUpServPayload);
      expect(payload.version).to.be.equal(10);
      expect(payload.height).to.be.equal(20);
      expect(payload.merkleRootMNList).to.be.equal(merkleRootMNList);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    after(function () {
      ProTxUpServPayload.prototype.validate.restore();
    })
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as version', function () {
      var payload = validProTxUpServPayload.copy();

      payload.version = -1;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = 1.5;

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = '12';

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate()
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = 123;

      expect(function () {
        payload.validate()
      }).not.to.throw;
    });
    it('Should allow only unsigned integer as height', function () {
      var payload = validProTxUpServPayload.copy();

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
      var payload = validProTxUpServPayload.copy();

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
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProTxUpServPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProTxUpServPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(payload.version);
      expect(payloadJSON.height).to.be.equal(payload.height);
      expect(payloadJSON.merkleRootMNList).to.be.equal(payload.merkleRootMNList);
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);
      ProTxUpServPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProTxUpServPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProTxUpServPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = ProTxUpServPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(payload.version);
      expect(restoredPayload.height).to.be.equal(payload.height);
      expect(restoredPayload.merkleRootMNList).to.be.equal(payload.merkleRootMNList);
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);
      ProTxUpServPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});