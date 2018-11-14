var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../../index');
var SubTxCloseAccountPayload = DashcoreLib.Transaction.Payload.SubTxCloseAccountPayload;
var PrivateKey = DashcoreLib.PrivateKey;
var BufferUtil = DashcoreLib.util.buffer;
var isHexString = DashcoreLib.util.js.isHexaString;
var privateKey = 'cQSA77TsRYNEsYRmLoY7Y3gNF3Kb5qff4yUv3hWB7fm46YQ2njqN';
var regTxHash = '54b8f5e4e77853f136ced5d29e92afabf380bf37ac54b46755c2211774960ee1';
var prevSubTxHash = 'bf742c5eafd6f8f1241a9e1a0a62fd7e5affed72178d8e03712fe42a34c27ca7';
var pubKeyId = new PrivateKey(privateKey).toPublicKey()._getID();
var CORRECT_SIGNATURE_SIZE = DashcoreLib.Transaction.Payload.constants.COMPACT_SIGNATURE_SIZE;
var payloadSig = '8167200911e63e846621d6e5c7f55ea872a791d9ef51fa32294ce2a3e4247016f0750c9cb7af3a50f19455b77f9789f79b7c5ecb84dbb897b3d50961b73a003b1f';

var validSubTxCloseAccountPayloadJSON = {
  version: 1,
  regTxHash: regTxHash,
  hashPrevSubTx: prevSubTxHash,
  creditFee: 1000,
};

var validSubTxCloseAccountPayloadJSONsigned = {
  version: 1,
  regTxHash: regTxHash,
  hashPrevSubTx: prevSubTxHash,
  creditFee: 1000,
  payloadSigSize: 65,
  payloadSig: payloadSig,
};

var validSubTxCloseAccountPayloadHexString = '0100e10e96741721c25567b454ac37bf80f3abaf929ed2d5ce36f15378e7e4f5b854a77cc2342ae42f71038e8d1772edff5a7efd620a1a9e1a24f1f8d6af5e2c74bfe80300000000000000';
var validSubTxCloseAccountPayloadBuffer = Buffer.from(validSubTxCloseAccountPayloadHexString, 'hex');
var validSubTxCloseAccountPayload = SubTxCloseAccountPayload.fromBuffer(validSubTxCloseAccountPayloadBuffer);

var validSubTxCloseAccountPayloadHexStringSigned = '0100e10e96741721c25567b454ac37bf80f3abaf929ed2d5ce36f15378e7e4f5b854a77cc2342ae42f71038e8d1772edff5a7efd620a1a9e1a24f1f8d6af5e2c74bfe803000000000000411f3b003ab76109d5b397b8db84cb5e7c9bf789977fb75594f1503aafb79c0c75f0167024e4a3e24c2932fa51efd991a772a85ef5c7e5d62166843ee61109206781';
var validSubTxCloseAccountPayloadBufferSigned = Buffer.from(validSubTxCloseAccountPayloadHexStringSigned, 'hex');
var validSubTxCloseAccountPayloadSigned = SubTxCloseAccountPayload.fromBuffer(validSubTxCloseAccountPayloadBufferSigned);

describe('SubTxCloseAccountPayload', function () {

  describe('constructor', function () {
    it('Should create SubTxCloseAccountPayload instance', function () {
      var payload = new SubTxCloseAccountPayload();
      expect(payload).to.have.property('version');
    });
  });

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    });

    it('Should return instance of SubTxCloseAccountPayload and call #validate on it', function() {
      var payload = SubTxCloseAccountPayload.fromBuffer(Buffer.from(validSubTxCloseAccountPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal(regTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(payload.creditFee).to.be.equal(1000);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validSubTxCloseAccountPayloadHexString + '0000', 'hex');

      expect(function() {
        SubTxCloseAccountPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

    it('Should return instance of SubTxCloseAccountPayload with parsed data', function () {
      var payloadBuffer = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .toBuffer({ skipSignature: true });

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = SubTxCloseAccountPayload.fromBuffer(payloadBuffer);
      expect(parsedPayload.regTxHash).to.be.equal(regTxHash);
      expect(parsedPayload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(parsedPayload.creditFee).to.be.equal(1000);

    });

    it('Should throw an error if data is incomplete', function () {
      var payloadBuffer = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .toBuffer({ skipSignature: true });
      // 2 bytes is payload version, 32 is regTxHash size, 32 is preSubTxHash
      var payloadBufferWithoutCreditFee = payloadBuffer.slice(0, 2 + 32 + 32);

      expect(function () {
        SubTxCloseAccountPayload.fromBuffer(payloadBufferWithoutCreditFee)
      }).to.throw();
    });

  });

  describe('.fromBuffer signed', function () {

    beforeEach(function () {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    });

    it('Should return instance of SubTxCloseAccountPayload and call #validate on it', function() {
      var payload = SubTxCloseAccountPayload.fromBuffer(Buffer.from(validSubTxCloseAccountPayloadHexStringSigned, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal(regTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(payload.creditFee).to.be.equal(1000);
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal(payloadSig);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validSubTxCloseAccountPayloadHexString + '0000', 'hex');

      expect(function() {
        SubTxCloseAccountPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    it('Should return instance of SubTxCloseAccountPayload and call #validate on it', function() {
      var payload = SubTxCloseAccountPayload.fromJSON(validSubTxCloseAccountPayloadJSON);

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal(regTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(payload.creditFee).to.be.equal(1000);
    });

    after(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    })

    it('Should return instance of SubTxCloseAccountPayload with correct parsed data', function () {
      var payloadJSON = {
        version: 10,
        regTxHash: regTxHash,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payload = SubTxCloseAccountPayload.fromJSON(payloadJSON);
      expect(payload.version).to.be.equal(10);
      expect(payload.regTxHash).to.be.equal(payloadJSON.regTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(payloadJSON.hashPrevSubTx);
      expect(payload.creditFee).to.be.equal(payloadJSON.creditFee);
      expect(BufferUtil.equals(payload.payloadSig, payloadJSON.payloadSig)).to.be.true;
    });
    it('Should throw an error if the data is incomplete', function () {
      var payloadWithoutRegTxHash = {
        version: 10,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutCreditFee = {
        version: 10,
        regTxHash: regTxHash,
        hashPrevSubTx: prevSubTxHash,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutVersion = {
        regTxHash: regTxHash,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithoutRegTxHash);
      }).to.throw('Invalid Argument: Expect regTxHash to be a hex string representing sha256 hash');
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithoutCreditFee);
      }).to.throw('Invalid Argument for creditFee, expected number but got undefined');
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithoutVersion);
      }).to.throw('Invalid Argument for version, expected number but got undefined');
    });
    it('Should throw an error if the data is incorrect', function () {
      var payloadWithIncorrectRegTxHash = {
        version: 10,
        regTxHash: 10,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithIncorrectVersion = {
        version: '10',
        regTxHash: regTxHash,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithIncorrectSignature = {
        version: 10,
        regTxHash: regTxHash,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSigSize: CORRECT_SIGNATURE_SIZE,
        payloadSig: 'signature'
      };
      var payloadWithIncorrectSignatureSize = {
        version: 10,
        regTxHash: regTxHash,
        hashPrevSubTx: prevSubTxHash,
        creditFee: 1000,
        payloadSig: BufferUtil.emptyBuffer(22).toString('hex')
      };
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithIncorrectRegTxHash);
      }).to.throw('Invalid Argument: Expect regTxHash to be a hex string representing sha256 hash');
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithIncorrectVersion);
      }).to.throw('Invalid Argument for version, expected number but got string');
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithIncorrectSignature);
      }).to.throw('Invalid Argument: expect payloadSig to be a hex string but got string');
      expect(function () {
        SubTxCloseAccountPayload.fromJSON(payloadWithIncorrectSignatureSize);
      }).to.throw('Invalid Argument: Invalid payloadSigSize size');
    });
  });

  describe('.fromJSON signed', function () {
    before(function() {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    it('Should return instance of SubTxCloseAccountPayload and call #validate on it', function() {
      var payload = SubTxCloseAccountPayload.fromJSON(validSubTxCloseAccountPayloadJSONsigned);

      expect(payload.version).to.be.equal(1);
      expect(payload.regTxHash).to.be.equal(regTxHash);
      expect(payload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(payload.creditFee).to.be.equal(1000);
      expect(payload.payloadSigSize).to.be.equal(65);
      expect(payload.payloadSig).to.be.equal(payloadSig);
    });

    after(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    })
  });
  describe('#setRegTxHash', function () {
    it('Should set regTxHash and return instance back', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash);

      expect(payload).to.be.an.instanceOf(SubTxCloseAccountPayload);
      expect(payload.regTxHash).to.be.equal(regTxHash);
    });
  });
  describe('#setPrevSubTxHash', function () {
    it('Should set regTxHash and return instance back', function () {
      var payload = new SubTxCloseAccountPayload()
        .setPrevSubTxHash(prevSubTxHash);

      expect(payload).to.be.an.instanceOf(SubTxCloseAccountPayload);
      expect(payload.hashPrevSubTx).to.be.equal(prevSubTxHash);
    });
  });
  describe('#setCreditFee', function () {
    it('Should set creditFee and return instance back', function () {
      var payload = new SubTxCloseAccountPayload()
        .setCreditFee(1000);

      expect(payload).to.be.an.instanceOf(SubTxCloseAccountPayload);
      expect(payload.creditFee).to.be.deep.equal(1000);
    });
  });
  describe('#sign', function () {
    it('Should sign payload and return instance back if a private key is a string', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .sign(privateKey);
      expect(payload.payloadSig).to.be.a.string;
      expect(isHexString(payload.payloadSig)).to.be.true;
      expect(payload.payloadSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE * 2);
    });
    it('Should sign payload and return instance back if a private key is an instance of PrivateKey', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .sign(new PrivateKey(privateKey));
      expect(payload.payloadSig).to.be.a.string;
      expect(isHexString(payload.payloadSig)).to.be.true;
      expect(payload.payloadSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE * 2);
    });
    it('Should throw when trying to sign incomplete data', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash);

      expect(function () {
        payload.sign(privateKey);
      }).to.throw('Invalid Argument for creditFee, expected number but got undefined');
    });
  });
  describe('#verifySignature', function () {
    it('Should verify signature if pubKeyId is a Buffer', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .sign(privateKey);

      expect(payload.verifySignature(SubTxCloseAccountPayload.convertPrivateKeyToPubKeyId(privateKey))).to.be.true;
    });
    it('Should verify signature if pubKeyId is a hex string', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .sign(privateKey);

      expect(payload.verifySignature(pubKeyId.toString('hex'))).to.be.true;
    });
    it('Should return false if pubKeyId doesn\'t match the signature', function () {
      var payload = new SubTxCloseAccountPayload()
        .setRegTxHash(regTxHash)
        .setPrevSubTxHash(prevSubTxHash)
        .setCreditFee(1000)
        .sign(privateKey);

      expect(payload.verifySignature(new PrivateKey().toPublicKey()._getID())).to.be.false;
    });
  });
  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validSubTxCloseAccountPayload;

      var payloadJSON = payload.toJSON({ skipSignature: true });

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal(regTxHash);
      expect(payloadJSON.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(payloadJSON.creditFee).to.be.equal(1000);

    });
    it('Should call #validate', function () {
      var payload = SubTxCloseAccountPayload.fromJSON(validSubTxCloseAccountPayloadJSON);
      SubTxCloseAccountPayload.prototype.validate.reset();
      payload.toJSON({ skipSignature: true });
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toJSON signed', function () {
    beforeEach(function () {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validSubTxCloseAccountPayloadSigned;
      var payloadJSON = payload.toJSON();
      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.regTxHash).to.be.equal(regTxHash);
      expect(payloadJSON.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(payloadJSON.creditFee).to.be.equal(1000);
      expect(payloadJSON.payloadSigSize).to.be.equal(65);
      expect(payloadJSON.payloadSig).to.be.equal(payloadSig);

    });
    it('Should call #validate', function () {
      var payload = SubTxCloseAccountPayload.fromJSON(validSubTxCloseAccountPayloadJSONsigned);
      SubTxCloseAccountPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validSubTxCloseAccountPayload;

      var serializedPayload = payload.toBuffer({ skipSignature: true });
      var restoredPayload = SubTxCloseAccountPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal(regTxHash);
      expect(restoredPayload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(restoredPayload.creditFee).to.be.equal(1000);
      expect(restoredPayload.payloadSigSize).to.be.equal(0);
    });
    it('Should call #validate', function () {
      var payload = SubTxCloseAccountPayload.fromJSON(validSubTxCloseAccountPayloadJSON);
      SubTxCloseAccountPayload.prototype.validate.reset();
      payload.toBuffer({ skipSignature: true });
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer signed', function () {
    beforeEach(function () {
      sinon.spy(SubTxCloseAccountPayload.prototype, 'validate');
    });

    afterEach(function () {
      SubTxCloseAccountPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validSubTxCloseAccountPayloadSigned;

      var serializedPayload = payload.toBuffer();
      var restoredPayload = SubTxCloseAccountPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.regTxHash).to.be.equal(regTxHash);
      expect(restoredPayload.hashPrevSubTx).to.be.equal(prevSubTxHash);
      expect(restoredPayload.creditFee).to.be.equal(1000);
      expect(restoredPayload.payloadSigSize).to.be.equal(65);
      expect(restoredPayload.payloadSig).to.be.equal(payloadSig);
    });
    it('Should call #validate', function () {
      var payload = SubTxCloseAccountPayload.fromJSON(validSubTxCloseAccountPayloadJSONsigned);
      SubTxCloseAccountPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});