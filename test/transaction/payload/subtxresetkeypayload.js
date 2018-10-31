var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../../index');
var SubTxResetKeyPayload = DashcoreLib.Transaction.Payload.SubTxResetKeyPayload;
var PrivateKey = DashcoreLib.PrivateKey;
var BufferUtil = DashcoreLib.util.buffer;
var isHexString = DashcoreLib.util.js.isHexaString;
var privateKey = 'cQSA77TsRYNEsYRmLoY7Y3gNF3Kb5qff4yUv3hWB7fm46YQ2njqN';
var subTxHash = '54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1';
var pubKeyId = new PrivateKey(privateKey).toPublicKey()._getID();
var CORRECT_SIGNATURE_SIZE = DashcoreLib.Transaction.Payload.constants.COMPACT_SIGNATURE_SIZE;
var payloadSig = '96a4dba864e46b2a8283763351a74a53ebc0a7ce7611f62b5250b6592156b618d584c363bf04dc20ebd5f8ba8f073e0e4e78a89364e5c57a814eef6278fd51ab1f';

var validSubTxResetKeyPayloadJSON = {
  version: 1,
  regTxHash: subTxHash,
  hashPrevSubTx: subTxHash,
  creditFee: 1000,
  //newPubKeySize: 20,
  newPubKey: pubKeyId,
};

var validSubTxResetKeyPayloadJSONsigned = {
  version: 1,
  regTxHash: subTxHash,
  hashPrevSubTx: subTxHash,
  creditFee: 1000,
  //newPubKeySize: 20,
  newPubKey: pubKeyId,
  payloadSigSize: 65,
  payloadSig: payloadSig,
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
      expect(payload.regTxHash).to.be.equal(subTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(payload.newPubKey, pubKeyId)).to.be.true;
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validSubTxResetKeyPayloadHexString + '0000', 'hex');

      expect(function() {
        SubTxResetKeyPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

    it('Should return instance of SubTxResetKeyPayload with parsed data', function () {
      var payloadBuffer = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .toBuffer({ skipSignature: true });

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = SubTxResetKeyPayload.fromBuffer(payloadBuffer);
      expect(parsedPayload.regTxHash).to.be.equal(subTxHash);
      expect(parsedPayload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(parsedPayload.creditFee).to.be.equal(1000);
      expect(BufferUtil.equals(parsedPayload.newPubKey, pubKeyId)).to.be.true;

    });

    it('Should throw an error if data is incomplete', function () {
      var payloadBuffer = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .toBuffer({ skipSignature: true });
      // 2 bytes is payload version, 32 is regTxHash size, 32 is preSubTxHash, 8 is varint size for creditFee of 1000 duffs
      var payloadBufferWithoutPubKeyId = payloadBuffer.slice(0, 2 + 32 + 32 + 8);

      expect(function () {
        SubTxResetKeyPayload.fromBuffer(payloadBufferWithoutPubKeyId)
      }).to.throw();
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
      expect(payload.regTxHash).to.be.equal(subTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(payload.newPubKey, pubKeyId)).to.be.true;
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal(payloadSig);
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
      expect(payload.regTxHash).to.be.equal(subTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(payload.newPubKey, pubKeyId)).to.be.true;
    });

    after(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    })

    it('Should return instance of SubTxResetKeyPayload with correct parsed data', function () {
      var payloadJSON = {
        version: 10,
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payload = SubTxResetKeyPayload.fromJSON(payloadJSON);
      expect(payload.version).to.be.equal(10);
      expect(payload.regTxHash).to.be.equal(payloadJSON.regTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(payloadJSON.hashPrevSubTx);
      expect(payload.creditFee).to.be.equal(payloadJSON.creditFee);
      expect(BufferUtil.equals(payload.newPubKey, payloadJSON.newPubKey)).to.be.true;
      expect(BufferUtil.equals(payload.payloadSig, payloadJSON.payloadSig)).to.be.true;
    });
    it('Should throw an error if the data is incomplete', function () {
      var payloadWithoutRegTxHash = {
        version: 10,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutNewPubKey = {
        version: 10,
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutVersion = {
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithoutRegTxHash);
      }).to.throw('Invalid Argument: Expect regTxHash to be a hex string representing sha256 hash');
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithoutNewPubKey);
      }).to.throw('Invalid Argument: expect newPubKey to be a Buffer but got undefined');
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithoutVersion);
      }).to.throw('Invalid Argument for version, expected number but got undefined');
    });
    it('Should throw an error if the data is incorrect', function () {
      var payloadWithIncorrectRegTxHash = {
        version: 10,
        regTxHash: 10,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithIncorrectPubKeyId = {
        version: 10,
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: 'pubKeyId',
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithIncorrectVersion = {
        version: '10',
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithIncorrectSignature = {
        version: 10,
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: 'signature'
      };
      var payloadWithIncorrectSignatureSize = {
        version: 10,
        regTxHash: subTxHash,
        hashPrevSubTx: subTxHash,
        creditFee: 1000,
        newPubKey: pubKeyId,
        payloadSig: BufferUtil.emptyBuffer(22).toString('hex')
      };
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithIncorrectRegTxHash);
      }).to.throw('Invalid Argument: Expect regTxHash to be a hex string representing sha256 hash');
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithIncorrectPubKeyId);
      }).to.throw('Invalid Argument: expect newPubKey to be a Buffer but got string');
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithIncorrectVersion);
      }).to.throw('Invalid Argument for version, expected number but got string');
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithIncorrectSignature);
      }).to.throw('Invalid Argument: expect payloadSig to be a hex string but got string');
      expect(function () {
        SubTxResetKeyPayload.fromJSON(payloadWithIncorrectSignatureSize);
      }).to.throw('Invalid Argument: Invalid payloadSigSize size');
    });
  });

  describe('.fromJSON signed', function () {
    before(function() {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    it('Should return instance of SubTxResetKeyPayload and call #validate on it', function() {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSONsigned);

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal(subTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(payload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(payload.newPubKey, pubKeyId)).to.be.true;
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal(payloadSig);
    });

    after(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    })
  });
  describe('#setRegTxHash', function () {
    it('Should set regTxHash and return instance back', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash);

      expect(payload).to.be.an.instanceOf(SubTxResetKeyPayload);
      expect(payload.regTxHash).to.be.equal(subTxHash);
    });
  });
  describe('#setPrevSubTxHash', function () {
    it('Should set regTxHash and return instance back', function () {
      var payload = new SubTxResetKeyPayload()
        .setPrevSubTxHash(subTxHash);

      expect(payload).to.be.an.instanceOf(SubTxResetKeyPayload);
      expect(payload.hashPrevSubTx).to.be.equal(subTxHash);
    });
  });
  describe('#setCreditFee', function () {
    it('Should set creditFee and return instance back', function () {
      var payload = new SubTxResetKeyPayload()
        .setCreditFee(1000);

      expect(payload).to.be.an.instanceOf(SubTxResetKeyPayload);
      expect(payload.creditFee).to.be.deep.equal(1000);
    });
  });
  describe('#setNewPubKey', function () {
    it('Should set newPubKey and return instance back', function () {
      var payload = new SubTxResetKeyPayload()
        .setNewPubKeyId(pubKeyId);

      expect(payload).to.be.an.instanceOf(SubTxResetKeyPayload);
      expect(payload.newPubKey).to.be.deep.equal(pubKeyId);
    });
  });
  describe('#sign', function () {
    it('Should sign payload and return instance back if a private key is a string', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .sign(privateKey);
      expect(payload.payloadSig).to.be.a.string;
      expect(isHexString(payload.payloadSig)).to.be.true;
      expect(payload.payloadSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE * 2);
    });
    it('Should sign payload and return instance back if a private key is an instance of PrivateKey', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .sign(new PrivateKey(privateKey));
      expect(payload.payloadSig).to.be.a.string;
      expect(isHexString(payload.payloadSig)).to.be.true;
      expect(payload.payloadSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE * 2);
    });
    it('Should throw when trying to sign incomplete data', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)

      expect(function () {
        payload.sign(privateKey);
      }).to.throw('Invalid Argument for creditFee, expected number but got undefined');
    });
  });
  describe('#verifySignature', function () {
    it('Should verify signature if pubKeyId is a Buffer', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .sign(privateKey);

      expect(payload.verifySignature(SubTxResetKeyPayload.convertPrivateKeyToPubKeyId(privateKey))).to.be.true;
    });
    it('Should verify signature if pubKeyId is a hex string', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .sign(privateKey);

      expect(payload.verifySignature(pubKeyId.toString('hex'))).to.be.true;
    });
    it('Should return false if pubKeyId doesn\'t match the signature', function () {
      var payload = new SubTxResetKeyPayload()
        .setRegTxHash(subTxHash)
        .setPrevSubTxHash(subTxHash)
        .setCreditFee(1000)
        .setNewPubKeyId(pubKeyId)
        .sign(privateKey);

      expect(payload.verifySignature(new PrivateKey().toPublicKey()._getID())).to.be.false;
    });
  });
  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(SubTxResetKeyPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxResetKeyPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validSubTxResetKeyPayload;

      var payloadJSON = payload.toJSON({ skipSignature: true });

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal(subTxHash);
      expect(payloadJSON.hashPrevSubTx).to.be.equal(subTxHash);
      expect(payloadJSON.creditFee).to.be.equal(1000);
      //expect(payloadJSON.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(payloadJSON.newPubKey, pubKeyId)).to.be.true;

    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSON);
      SubTxResetKeyPayload.prototype.validate.reset();
      payload.toJSON({ skipSignature: true });
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
      var payload = validSubTxResetKeyPayloadSigned;
      var payloadJSON = payload.toJSON();
      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal(subTxHash);
      expect(payloadJSON.hashPrevSubTx).to.be.equal(subTxHash);
      expect(payloadJSON.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(payloadJSON.newPubKey, pubKeyId)).to.be.true;
      expect(payloadJSON.payloadSigSize).to.be.equal(65);
      expect(payloadJSON.payloadSig).to.be.equal(payloadSig);

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
      var payload = validSubTxResetKeyPayload;

      var serializedPayload = payload.toBuffer({ skipSignature: true });
      var restoredPayload = SubTxResetKeyPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal(subTxHash);
      expect(restoredPayload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(restoredPayload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(restoredPayload.newPubKey, pubKeyId)).to.be.true;
      expect(restoredPayload.payloadSigSize).to.be.equal(0);
    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSON);
      SubTxResetKeyPayload.prototype.validate.reset();
      payload.toBuffer({ skipSignature: true });
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
      var payload = validSubTxResetKeyPayloadSigned;

      var serializedPayload = payload.toBuffer();
      var restoredPayload = SubTxResetKeyPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal(subTxHash);
      expect(restoredPayload.hashPrevSubTx).to.be.equal(subTxHash);
      expect(restoredPayload.creditFee).to.be.equal(1000);
      //expect(payload.newPubKeySize).to.be.equal(20);
      expect(BufferUtil.equals(restoredPayload.newPubKey, pubKeyId)).to.be.true;
      expect(restoredPayload.payloadSigSize).to.be.equal(65);
      expect(restoredPayload.payloadSig).to.be.equal(payloadSig);
    });
    it('Should call #validate', function () {
      var payload = SubTxResetKeyPayload.fromJSON(validSubTxResetKeyPayloadJSONsigned);
      SubTxResetKeyPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});
