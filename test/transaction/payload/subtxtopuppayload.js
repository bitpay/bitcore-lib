var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');
var SubTxTopupPayload = DashcoreLib.Transaction.Payload.SubTxTopupPayload;

var validSubTxTopupPayloadJSON = {
  version: 1,
  regTxHash: '45fd882f0df723d90a01a56ee1e83f45bf2446fd45d03522f390aae5b7f12737'
};
var validSubTxTopupPayloadHexString = '01003727f1b7e5aa90f32235d045fd4624bf453fe8e16ea5010ad923f70d2f88fd45';
var validSubTxTopupPayloadBuffer = Buffer.from(validSubTxTopupPayloadHexString, 'hex');
var validSubTxTopupPayload = SubTxTopupPayload.fromBuffer(validSubTxTopupPayloadBuffer);

describe('SubTxTopupPayload', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(SubTxTopupPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxTopupPayload.prototype.validate.restore();
    });

    it('Should return instance of SubTxTopupPayload and call #validate on it', function() {
      var payload = SubTxTopupPayload.fromBuffer(Buffer.from(validSubTxTopupPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal('45fd882f0df723d90a01a56ee1e83f45bf2446fd45d03522f390aae5b7f12737');
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validSubTxTopupPayloadHexString + '0000', 'hex');

      expect(function() {
        SubTxTopupPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(SubTxTopupPayload.prototype, 'validate');
    });

    it('Should return instance of SubTxTopupPayload and call #validate on it', function() {
      var payload = SubTxTopupPayload.fromJSON(validSubTxTopupPayloadJSON);

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal('45fd882f0df723d90a01a56ee1e83f45bf2446fd45d03522f390aae5b7f12737');
    });

    after(function () {
      SubTxTopupPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(SubTxTopupPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxTopupPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validSubTxTopupPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal('45fd882f0df723d90a01a56ee1e83f45bf2446fd45d03522f390aae5b7f12737');
    });
    it('Should call #validate', function () {
      var payload = SubTxTopupPayload.fromJSON(validSubTxTopupPayloadJSON);
      SubTxTopupPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(SubTxTopupPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxTopupPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validSubTxTopupPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = SubTxTopupPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal('45fd882f0df723d90a01a56ee1e83f45bf2446fd45d03522f390aae5b7f12737');
    });
    it('Should call #validate', function () {
      var payload = SubTxTopupPayload.fromJSON(validSubTxTopupPayloadJSON);
      SubTxTopupPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});