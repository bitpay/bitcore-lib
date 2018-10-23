var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProUpRegTxPayload = Payload.ProUpRegTxPayload;

var validProUpRegTxPayloadJSON = {
  version: 1,
  proTXHash: '01040eb32f760490054543356cff463865633439dd073cffa570305eb086f70e',
  // mode: 0,
  keyIdOperator: 'e72ec3cdd5a87c47db3dd983f0329abe34b92908',
  keyIdVoting: 'c2ae01fb4084cbc3bc31e7f59b36be228a320404',
  scriptPayout: 'ac88c21664f1db4d073f45fd45d762b37417c885da4f14a976',
  inputsHash: '0e47b3e02ffe6316db51d30e598b8cb671c50713511427f32ed78aeb8215d024',
  payloadSig: '1ca150395389416102887e0a5dd609a3d477edf1f79faaf61603e4dc2564a4b31b603671cdd719e617f0588bd541568131f0d9444e0b5e2deba9dd16e927f48911',
}

var validProUpRegTxPayloadHexString = '01000ef786b05e3070a5ff3c07dd393463653846ff6c354345059004762fb30e04010829b934be9a32f083d93ddb477ca8d5cdc32ee70404328a22be369bf5e731bcc3cb8440fb01aec21976a9144fda85c81774b362d745fd453f074ddbf16416c288ac24d01582eb8ad72ef32714511307c571b68c8b590ed351db1663fe2fe0b3470e411ca150395389416102887e0a5dd609a3d477edf1f79faaf61603e4dc2564a4b31b603671cdd719e617f0588bd541568131f0d9444e0b5e2deba9dd16e927f48911';
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
      expect(payload.keyIdOperator).to.be.equal(validProUpRegTxPayloadJSON.keyIdOperator);
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
      expect(payload.keyIdOperator).to.be.equal(validProUpRegTxPayloadJSON.keyIdOperator);
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
      expect(payloadJSON.keyIdOperator).to.be.equal(validProUpRegTxPayloadJSON.keyIdOperator);
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
      expect(serializedPayload.byteLength).to.be.equal(198);

      var restoredPayload = ProUpRegTxPayload.fromBuffer(serializedPayload);
      expect(restoredPayload.version).to.be.equal(validProUpRegTxPayloadJSON.version);
      expect(restoredPayload.proTXHash).to.be.equal(validProUpRegTxPayloadJSON.proTXHash);
      expect(restoredPayload.keyIdOperator).to.be.equal(validProUpRegTxPayloadJSON.keyIdOperator);
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
