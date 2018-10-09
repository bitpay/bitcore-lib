var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var ProTxUpServPayload = DashcoreLib.Transaction.Payload.ProTxUpServPayload;

var merkleRootMNList = 'e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
console.log(merkleRootMNList);

var validProTxUpServPayloadJSON = {
  version: 1,
  proTXHash: '0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4',
  port: 1236,
  ipAddress: '00000000000000000000ffff01020306',
  inputsHash: '887c37ba2939057858c340d231185ce2e70e66e1615d3165b1efa6854a10628c',
  //address: 'yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb'
  merkleRootMNList: merkleRootMNList,
  scriptOperatorPayout: '76a9148603df234fe8f26064439de60ed13eb92d76cc5588ac'
};
var validProTxUpServPayloadHexString = '0100a45f4e6af45dfc15d44147ec6e5ab0d8d2048ea2e95e2820f7cdfd1c1b9175094312010000000000000000000000ffff0102030604d41976a9148603df234fe8f26064439de60ed13eb92d76cc5588ac8c62104a85a6efb165315d61e1660ee7e25c1831d240c35878053929ba377c88411fdaf84b78552f91c99eb267efec1be0e63b7459e66f142daabb0345477842592b68ce0f59b163657c480061fe834a888f9a9697e7635b36b4ede84a2374ad9831';
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
      var payload = ProTxUpServPayload.fromBuffer(Buffer.from(validProTxUpServPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      // 1.2.3.6 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffff01020306');
      expect(payload.inputsHash).to.be.equal('887c37ba2939057858c340d231185ce2e70e66e1615d3165b1efa6854a10628c');
      expect(payload.port).to.be.equal(1236);
      expect(payload.protocolVersion).to.be.equal(70211);
      expect(new Script(payload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
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
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      // 1.2.3.6 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffff01020306');
      expect(payload.port).to.be.equal(1236);
      expect(payload.protocolVersion).to.be.equal(70211);
      expect(new Script(payload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
    });

    after(function () {
      ProTxUpServPayload.prototype.validate.restore();
    })
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

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      // 1.2.3.6 mapped to IPv6
      expect(payloadJSON.ipAddress).to.be.equal('00000000000000000000ffff01020306');
      expect(payloadJSON.port).to.be.equal(1236);
      expect(payloadJSON.protocolVersion).to.be.equal(70211);
      expect(new Script(payloadJSON.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
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

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      // 1.2.3.6 mapped to IPv6
      expect(restoredPayload.ipAddress).to.be.equal('00000000000000000000ffff01020306');
      expect(restoredPayload.port).to.be.equal(1236);
      expect(restoredPayload.protocolVersion).to.be.equal(70211);
      expect(new Script(restoredPayload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);
      ProTxUpServPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});