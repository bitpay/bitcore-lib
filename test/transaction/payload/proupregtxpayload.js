var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProUpRegTxPayload = Payload.ProUpRegTxPayload;

var validProUpRegTxPayloadJSON = {
  version: 1,
  proTXHash: '62330c04f20acc541c8d4f3022ba2b032ea5530c476e61dc9c4235ac20d10f4f',
  mode: 0,
  pubKeyOperator: '18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda',
  keyIdVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
  scriptPayout: 'ac88506c1d9f6540f456cf3e73d34f1cee48be595cf214a976',
  inputsHash: 'ab6d7e9bb4e3cacd56dbd88f4e28a0e952a91a39f29ee7527f1a456712a509b3',
  payloadSig: '20c838c08b9492c5039444cac11e466df3609c585010fab636de75c687bab9f6154d9a7c26d7b5384a147fc67ddb2e66e5f773af73dbf818109aec692ed364eafd',
}

var validProUpRegTxPayloadHexString = '01004f0fd120ac35429cdc616e470c53a52e032bba22304f8d1c54cc0af2040c3362000018ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda8a94fb062049b841f716dcded8257a3632fb053c1976a914f25c59be48ee1c4fd3733ecf56f440659f1d6c5088acb309a51267451a7f52e79ef2391aa952e9a0284e8fd8db56cdcae3b49b7e6dab4120c838c08b9492c5039444cac11e466df3609c585010fab636de75c687bab9f6154d9a7c26d7b5384a147fc67ddb2e66e5f773af73dbf818109aec692ed364eafd';
var validProUpRegTxPayloadBuffer = Buffer.from(validProUpRegTxPayloadHexString, 'hex');
var validProUpRegTxPayload = ProUpRegTxPayload.fromBuffer(validProUpRegTxPayloadBuffer);
var validProUpRegTxHash = 'a64e3e06c71873aff149c446d76618efad9a5908007886f6024e9fddb3e6aa13';

describe('ProUpRegTxPayload', function () {
  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProUpRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRegTxPayload.prototype.validate.restore();
    });

    it('Should return instance of ProUpRegTxPayload and call #validate on it', function() {
      ProUpRegTxPayload.prototype.validate.reset();
      var payload = ProUpRegTxPayload.fromBuffer(Buffer.from(validProUpRegTxPayloadHexString, 'hex'));
      expect(payload.validate.callCount).to.be.equal(1);

      expect(payload.version).to.be.equal(validProUpRegTxPayloadJSON.version);
      expect(payload.proTXHash).to.be.equal(validProUpRegTxPayloadJSON.proTXHash);
      expect(payload.mode).to.be.equal(validProUpRegTxPayloadJSON.mode);
      expect(payload.pubKeyOperator).to.be.equal(validProUpRegTxPayloadJSON.pubKeyOperator);
      expect(payload.keyIdVoting).to.be.equal(validProUpRegTxPayloadJSON.keyIdVoting);
      expect(payload.scriptPayout).to.be.equal(validProUpRegTxPayloadJSON.scriptPayout);
      expect(payload.inputsHash).to.be.equal(validProUpRegTxPayloadJSON.inputsHash);
      expect(payload.payloadSig).to.be.equal(validProUpRegTxPayloadJSON.payloadSig);
    });

    it('Should throw an error when there is unexpected information in the raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProUpRegTxPayloadHexString + '0000', 'hex');
      expect(function() {
        ProUpRegTxPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProUpRegTxPayload.prototype, 'validate');
    });

    it('Should return instance of ProUpRegTxPayload and call #validate on it', function() {
      var payload = ProUpRegTxPayload.fromJSON(validProUpRegTxPayloadJSON);

      expect(payload.version).to.be.equal(validProUpRegTxPayloadJSON.version);
      expect(payload.proTXHash).to.be.equal(validProUpRegTxPayloadJSON.proTXHash);
      expect(payload.mode).to.be.equal(validProUpRegTxPayloadJSON.mode);
      expect(payload.pubKeyOperator).to.be.equal(validProUpRegTxPayloadJSON.pubKeyOperator);
      expect(payload.keyIdVoting).to.be.equal(validProUpRegTxPayloadJSON.keyIdVoting);
      expect(payload.scriptPayout).to.be.equal(validProUpRegTxPayloadJSON.scriptPayout);
      expect(payload.inputsHash).to.be.equal(validProUpRegTxPayloadJSON.inputsHash);
      expect(payload.payloadSig).to.be.equal(validProUpRegTxPayloadJSON.payloadSig);
    });

    after(function () {
      ProUpRegTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(ProUpRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProUpRegTxPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(validProUpRegTxPayloadJSON.version);
      expect(payloadJSON.proTXHash).to.be.equal(validProUpRegTxPayloadJSON.proTXHash);
      expect(payloadJSON.mode).to.be.equal(validProUpRegTxPayloadJSON.mode);
      expect(payloadJSON.pubKeyOperator).to.be.equal(validProUpRegTxPayloadJSON.pubKeyOperator);
      expect(payloadJSON.keyIdVoting).to.be.equal(validProUpRegTxPayloadJSON.keyIdVoting);
      expect(payloadJSON.scriptPayout).to.be.equal(validProUpRegTxPayloadJSON.scriptPayout);
      expect(payloadJSON.inputsHash).to.be.equal(validProUpRegTxPayloadJSON.inputsHash);
      expect(payloadJSON.payloadSig).to.be.equal(validProUpRegTxPayloadJSON.payloadSig);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProUpRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProUpRegTxPayload.copy();

      var serializedPayload = payload.toBuffer();
      expect(serializedPayload.byteLength).to.be.equal(228);

      var restoredPayload = ProUpRegTxPayload.fromBuffer(serializedPayload);
      expect(restoredPayload.version).to.be.equal(validProUpRegTxPayloadJSON.version);
      expect(restoredPayload.proTXHash).to.be.equal(validProUpRegTxPayloadJSON.proTXHash);
      expect(restoredPayload.mode).to.be.equal(validProUpRegTxPayloadJSON.mode);
      expect(restoredPayload.pubKeyOperator).to.be.equal(validProUpRegTxPayloadJSON.pubKeyOperator);
      expect(restoredPayload.keyIdVoting).to.be.equal(validProUpRegTxPayloadJSON.keyIdVoting);
      expect(restoredPayload.scriptPayout).to.be.equal(validProUpRegTxPayloadJSON.scriptPayout);
      expect(restoredPayload.inputsHash).to.be.equal(validProUpRegTxPayloadJSON.inputsHash);
      expect(restoredPayload.payloadSig).to.be.equal(validProUpRegTxPayloadJSON.payloadSig);
    });

    it('Should call #validate', function () {
      var payload = ProUpRegTxPayload.fromJSON(validProUpRegTxPayloadJSON);
      ProUpRegTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
