var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');
var SubTxResetKeyPayload = DashcoreLib.Transaction.Payload.SubTxResetKeyPayload;

var validSubTxResetKeyPayloadJSON = {
  version: 1,
  regTxHash: '54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1',
  hashPrevSubTx: '54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1',
  creditFee: 1000,
  //newPubKeySize: 20,
  newPubKey: 'a4163320ebc4bf150fd46acbf506c4ec82249ceb',
  payloadSigSize: 0,
};

var validSubTxResetKeyPayloadJSONsigned = {
  version: 1,
  regTxHash: '54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1',
  hashPrevSubTx: '54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1',
  creditFee: 1000,
  //newPubKeySize: 20,
  newPubKey: 'a4163320ebc4bf150fd46acbf506c4ec82249ceb',
  payloadSigSize: 65,
  payloadSig: '96a4dba864e46b2a8283763351a74a53ebc0a7ce7611f62b5250b6592156b618d584c363bf04dc20ebd5f8ba8f073e0e4e78a89364e5c57a814eef6278fd51ab1f',
};

var validSubTxResetKeyPayloadHexString = '0100e10e96741721c25567b454ac37bf80f3abaf929ed2d5ce36f15378e7e4f5b854e10e96741721c25567b454ac37bf80f3abaf929ed2d5ce36f15378e7e4f5b854e803000000000000eb9c2482ecc406f5cb6ad40f15bfc4eb203316a400';
var validSubTxResetKeyPayloadBuffer = Buffer.from(validSubTxResetKeyPayloadHexString, 'hex');
var validSubTxResetKeyPayload = SubTxResetKeyPayload.fromBuffer(validSubTxResetKeyPayloadBuffer);

var validSubTxResetKeyPayloadHexStringSigned = '0100e10e96741721c25567b454ac37bf80f3abaf929ed2d5ce36f15378e7e4f5b854e10e96741721c25567b454ac37bf80f3abaf929ed2d5ce36f15378e7e4f5b854e803000000000000eb9c2482ecc406f5cb6ad40f15bfc4eb203316a4411fab51fd7862ef4e817ac5e56493a8784e0e3e078fbaf8d5eb20dc04bf63c384d518b6562159b650522bf61176cea7c0eb534aa751337683822a6be464a8dba496';
var validSubTxResetKeyPayloadBufferSigned = Buffer.from(validSubTxResetKeyPayloadHexStringSigned, 'hex');
var validSubTxResetKeyPayloadSigned = SubTxResetKeyPayload.fromBuffer(validSubTxResetKeyPayloadBufferSigned);

describe('SubTxResetKeyPayload', function () {

  describe('constructor', function () {
    it('Should create SubTxResetKeyPayload instance', function () {
      var payload = new SubTxResetKeyPayload();
      expect(payload).to.have.property('version');
    });
  });

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should return instance of SubTxResetKeyPayload and call #validate on it', function() {
      var payload = SubTxResetKeyPayload.fromBuffer(Buffer.from(validSubTxResetKeyPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validSubTxResetKeyPayloadHexString + '0000', 'hex');

      expect(function() {
        SubTxResetKeyPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromBuffer signed', function () {

    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should return instance of SubTxResetKeyPayload and call #validate on it', function() {
      var payload = SubTxResetKeyPayload.fromBuffer(Buffer.from(validSubTxResetKeyPayloadHexStringSigned, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal('96a4dba864e46b2a8283763351a74a53ebc0a7ce7611f62b5250b6592156b618d584c363bf04dc20ebd5f8ba8f073e0e4e78a89364e5c57a814eef6278fd51ab1f');
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validSubTxResetKeyPayloadHexString + '0000', 'hex');

      expect(function() {
        SubTxResetKeyPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    it('Should return instance of SubTxResetKeyPayload and call #validate on it', function() {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSON);

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payload.payloadSigSize).to.be.equal(0);
    });

    after(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    })
  });

  describe('.fromJSON signed', function () {
    before(function() {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    it('Should return instance of SubTxResetKeyPayload and call #validate on it', function() {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSONsigned);

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal('96a4dba864e46b2a8283763351a74a53ebc0a7ce7611f62b5250b6592156b618d584c363bf04dc20ebd5f8ba8f073e0e4e78a89364e5c57a814eef6278fd51ab1f');
    });

    after(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validSubTxResetKeyPayload.copy();

      var options = { skipSignature: true };
      var payloadJSON = payload.toJSON(options);

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payloadJSON.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payloadJSON.creditFee).to.be.equal(1000);
      //expect(payloadJSON.newPubKeySize).to.be.equal(20);
      expect(payloadJSON.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payloadJSON.payloadSigSize).to.be.equal(0);

    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSON);
      SubTxResetKeyPayload.prototype.validate.reset();
      var options = { skipSignature: true };
      payload.toJSON(options);
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toJSON signed', function () {
    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validSubTxResetKeyPayloadSigned.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal('96a4dba864e46b2a8283763351a74a53ebc0a7ce7611f62b5250b6592156b618d584c363bf04dc20ebd5f8ba8f073e0e4e78a89364e5c57a814eef6278fd51ab1f');

    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSONsigned);
      SubTxResetKeyPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validSubTxResetKeyPayload.copy();

      var options = { skipSignature: true };
      var serializedPayload = payload.toBuffer(options);
      var restoredPayload = SubTxResetKeyPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payload.payloadSigSize).to.be.equal(0);
    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSON);
      SubTxResetKeyPayload.prototype.validate.reset();
      var options = { skipSignature: true };
      payload.toBuffer(options);
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer signed', function () {
    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validSubTxResetKeyPayloadSigned.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = SubTxResetKeyPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.hashPrevSubTx).to.be.equal('54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1');
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(payload.newPubKey).to.be.equal('a4163320ebc4bf150fd46acbf506c4ec82249ceb');
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal('96a4dba864e46b2a8283763351a74a53ebc0a7ce7611f62b5250b6592156b618d584c363bf04dc20ebd5f8ba8f073e0e4e78a89364e5c57a814eef6278fd51ab1f');
    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSONsigned);
      SubTxResetKeyPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});
