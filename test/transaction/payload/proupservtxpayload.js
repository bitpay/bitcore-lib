var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var ProTxUpServPayload = DashcoreLib.Transaction.Payload.ProTxUpServPayload;

var validProTxUpServPayloadJSON = {
  version: 1,
  proTXHash: 'c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b',
  port: 19999,
  ipAddress: '00000000000000000000ffffc38d8f31',
  scriptOperatorPayout: '76a9143e1f214c329557ae3711cb173bcf04d00762f3ff88ac',
  inputsHash: 'ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f',
  //address: 'yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7'
};
var validProTxUpServPayloadHexString = '01007b1100a3e33b86b1e9948a1091648b44ac2e819850e321bbbbd9a7825cf173c800000000000000000000ffffc38d8f314e1f1976a9143e1f214c329557ae3711cb173bcf04d00762f3ff88ac3f7685789f3e6480ba6ed402285da0ed9cd0558265603fa8bad0eec0572cf1eb1746f9c46d654879d9afd67a439d4bc2ef7c1b26de2e59897fa83242d9bd819ff46c71d9e3d7aa1772f4003349b777140bedebded0a42efd64baf34f59c4a79c128df711c10a45505a0c2a94a5908f1642cbb56730f16b2cc2419a45890fb8ff';
var validProTxUpServPayloadBuffer = Buffer.from(validProTxUpServPayloadHexString, 'hex');
var validProTxUpServPayload = ProTxUpServPayload.fromBuffer(validProTxUpServPayloadBuffer);

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
      expect(payload.proTXHash).to.be.equal('c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b');
      // 1.2.3.6 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payload.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f');
      expect(new Script(payload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7');
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
      expect(payload.proTXHash).to.be.equal('c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b');
      // 1.2.3.6 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payload.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f');
      expect(new Script(payload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7');
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
      expect(payloadJSON.proTXHash).to.be.equal('c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b');
      // 1.2.3.6 mapped to IPv6
      expect(payloadJSON.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payloadJSON.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f');
      expect(new Script(payloadJSON.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7');
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
      expect(restoredPayload.proTXHash).to.be.equal('c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b');
      // 1.2.3.6 mapped to IPv6
      expect(restoredPayload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(restoredPayload.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f');
      expect(new Script(restoredPayload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7');
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);
      ProTxUpServPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});
