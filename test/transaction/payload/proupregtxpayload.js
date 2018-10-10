var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProUpRegTxPayload = Payload.ProUpRegTxPayload;

var validProUpRegTxPayloadJSON = {
  version: 1,
  proTXHash: '0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4',
  mode: 1,
  keyIdOperator: '4d5fce2325deb034ae75a625a3e2f09395e27bf7',
  keyIdOwner: '4d5fce2325deb034ae75a625a3e2f09395e27bf7',
  scriptPayout: '76a9148603df234fe8f26064439de60ed13eb92d76cc5588ac',
  payloadSig: '48d6a1bd2cd9eec54eb866fc71209418a950402b5d7e52363bfb75c98e141175',
}

// TODO: The following need to be correctly defined
var validProUpRegTxPayloadHexString = '0100a45f4e6af45dfc15d44147ec6e5ab0d8d2048ea2e95e2820f7cdfd1c1b9175094312010000000000000000000000ffff0102030604d41976a9148603df234fe8f26064439de60ed13eb92d76cc5588ac8c62104a85a6efb165315d61e1660ee7e25c1831d240c35878053929ba377c88411fdaf84b78552f91c99eb267efec1be0e63b7459e66f142daabb0345477842592b68ce0f59b163657c480061fe834a888f9a9697e7635b36b4ede84a2374ad9831';
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
      // TODO: Is there supposed to be logic here to test that validate is called?
      var payload = ProUpRegTxPayload.fromBuffer(Buffer.from(validProUpRegTxPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      expect(payload.mode).to.be.equal(1);
      expect(payload.keyIdOperator).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(payload.keyIdOwner).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(new Script(payload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
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

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      expect(payload.mode).to.be.equal(1);
      expect(payload.keyIdOperator).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(payload.keyIdOwner).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(new Script(payload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
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

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      expect(payloadJSON.mode).to.be.equal(1);
      expect(payloadJSON.keyIdOperator).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(payloadJSON.keyIdOwner).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(new Script(payloadJSON.scriptPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
    });

    it('Should call #validate', function () {
      var payload = ProUpRegTxPayload.fromJSON(validProUpRegTxPayloadJSON);
      ProUpRegTxPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
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
      var restoredPayload = ProUpRegTxPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
      expect(restoredPayload.mode).to.be.equal(1);
      expect(restoredPayload.keyIdOperator).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(restoredPayload.keyIdOwner).to.be.equal('4d5fce2325deb034ae75a625a3e2f09395e27bf7');
      expect(new Script(restoredPayload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yYY42uyDZk8Rp32SSyjAAy2pUtzkAT2WDb');
    });

    it('Should call #validate', function () {
      var payload = ProUpRegTxPayload.fromJSON(validProUpRegTxPayloadJSON);
      ProUpRegTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
