var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var PrivateKey = DashcoreLib.PrivateKey;
var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var SubTxTransitionPayload = Payload.SubTxTransitionPayload;
var HashUtil = DashcoreLib.util.hashUtil;

var CORRECT_SIGNATURE_SIZE = Payload.constants.COMPACT_SIGNATURE_SIZE;
var privateKey = 'cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY';
var pubKeyId = new PrivateKey(privateKey).toPublicKey()._getID();
var validPayloadJSONFixture = {
  version: 10,
  creditFee: 100,
  hashPrevSubTx: HashUtil.getRandomHashHexString(),
  regTxId: HashUtil.getRandomHashHexString(),
  hashSTPacket: HashUtil.getRandomHashHexString()
};

var validPayloadFixture = SubTxTransitionPayload.fromJSON(validPayloadJSONFixture);

describe('SubTxTransitionPayload', function() {

  describe('constructor', function () {
    it('Should create SubTxTransitionPayload instance', function () {
      var payload = new SubTxTransitionPayload();
      expect(payload).to.have.property('version');
    });
  });

  describe('#setRegTxId', function () {
    it('Should set regTxId and return instance back', function () {
      var regTxId = HashUtil.getRandomHashHexString();

      var payload = new SubTxTransitionPayload()
        .setRegTxId(regTxId);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.regTxId).to.be.deep.equal(regTxId);
    });
  });

  describe('#setHashPrevSubTx', function () {
    it('Should set hashPrevSubTx and return instance back', function () {
      var hashPrevSubTx = HashUtil.getRandomHashHexString();

      var payload = new SubTxTransitionPayload()
        .setHashPrevSubTx(hashPrevSubTx);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.hashPrevSubTx).to.be.deep.equal(hashPrevSubTx);
    });
  });

  describe('#setCreditFee', function () {
    it('Should set creditFee and return instance back', function () {
      var creditFee = 10;

      var payload = new SubTxTransitionPayload()
        .setCreditFee(creditFee);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.creditFee).to.be.equal(creditFee);
    });
  });

  describe('#hashSTPacket', function () {
    it('Should set hashSTPacket and return instance back', function () {
      var hashSTPacket = HashUtil.getRandomHashHexString();

      var payload = new SubTxTransitionPayload()
        .setHashSTPacket(hashSTPacket);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.hashSTPacket).to.be.deep.equal(hashSTPacket);
    });
  });

  describe('fromBuffer', function () {
    it('Should return instance of SubTxTransitionPayload with parsed data', function () {
      var hashPrevSubTx = HashUtil.getRandomHashHexString();
      var regTxId = HashUtil.getRandomHashHexString();
      var hashSTPacket = HashUtil.getRandomHashHexString();

      var payload = new SubTxTransitionPayload()
        .setHashPrevSubTx(hashPrevSubTx)
        .setCreditFee(10)
        .setRegTxId(regTxId)
        .setHashSTPacket(hashSTPacket);

      var payloadBuffer = payload.toBuffer();
      var stringBuf = payloadBuffer.toString('hex');

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = SubTxTransitionPayload.fromBuffer(payloadBuffer);
      expect(parsedPayload.hashPrevSubTx).to.be.deep.equal(hashPrevSubTx);
      expect(parsedPayload.regTxId).to.be.deep.equal(regTxId);
      expect(parsedPayload.hashSTPacket).to.be.deep.equal(hashSTPacket);
      expect(parsedPayload.creditFee).to.be.equal(10);
      expect(parsedPayload.version).to.be.equal(payload.version);
    });
    it('Should throw an error if data is incomplete', function () {
      var hashPrevSubTx = HashUtil.getRandomHashHexString();
      var regTxId = HashUtil.getRandomHashHexString();
      var hashSTPacket = HashUtil.getRandomHashHexString();

      var payload = new SubTxTransitionPayload()
        .setHashPrevSubTx(hashPrevSubTx)
        .setCreditFee(10)
        .setRegTxId(regTxId)
        .setHashSTPacket(hashSTPacket);

      var payloadBuffer = payload.toBuffer();
      payloadBuffer = payloadBuffer.slice(0, payloadBuffer.length - 32);

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      expect(function () {
        SubTxTransitionPayload.fromBuffer(payloadBuffer);
      }).to.throw();
    });
  });
  describe('fromJSON', function () {
    it('Should return instance of SubTxTransitionPayload with correct parsed data', function () {
      var payloadJSON = {
        version: 10,
        creditFee: 100,
        hashPrevSubTx: HashUtil.getRandomHashHexString(),
        regTxId: HashUtil.getRandomHashHexString(),
        hashSTPacket: HashUtil.getRandomHashHexString(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payload = SubTxTransitionPayload.fromJSON(payloadJSON);
      expect(payload.version).to.be.equal(10);
      expect(payload.creditFee).to.be.equal(100);
      expect(payload.hashPrevSubTx).to.be.deep.equal(payloadJSON.hashPrevSubTx);
      expect(payload.hashSTPacket).to.be.deep.equal(payloadJSON.hashSTPacket);
      expect(payload.regTxId).to.be.deep.equal(payloadJSON.regTxId);
      expect(payload.creditFee).to.be.deep.equal(payloadJSON.creditFee);
    });
    it('Should throw an error if the data is incomplete', function () {
      var payloadWithoutHashPrevSubTx = {
        version: 10,
        creditFee: 100,
        regTxId: HashUtil.getRandomHashHexString(),
        hashSTPacket: HashUtil.getRandomHashHexString(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutRegTxId = {
        version: 10,
        creditFee: 100,
        hashPrevSubTx: HashUtil.getRandomHashHexString(),
        hashSTPacket: HashUtil.getRandomHashHexString(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutHashSTPacket = {
        version: 10,
        creditFee: 100,
        hashPrevSubTx: HashUtil.getRandomHashHexString(),
        regTxId: HashUtil.getRandomHashHexString(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      var payloadWithoutCreditFee = {
        version: 10,
        hashPrevSubTx: HashUtil.getRandomHashHexString(),
        hashSTPacket: HashUtil.getRandomHashHexString(),
        regTxId: HashUtil.getRandomHashHexString(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE).toString('hex')
      };
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithoutHashPrevSubTx);
      }).to.throw('Invalid Argument: expect hashPrevSubTx to be a hex string but got undefined');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithoutRegTxId);
      }).to.throw('Invalid Argument: expect regTxId to be a hex string but got undefined');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithoutHashSTPacket);
      }).to.throw('Invalid Argument: expect hashSTPacket to be a hex string but got undefined');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithoutCreditFee);
      }).to.throw('Invalid Argument for creditFee, expected number but got undefined');

    });
    it('Should throw an error if the data is incorrect', function () {
      var invalidVersions = [-1, '1', 1.5, []];
      var payloadsWithInvalidVersions = invalidVersions.map(function (version) {
        var payload = validPayloadFixture.copy().toJSON();
        payload.version = version;
        return payload;
      });
      payloadsWithInvalidVersions.forEach(function (payloadWithInvalidVersion) {
        expect(function () {
          SubTxTransitionPayload.fromJSON(payloadWithInvalidVersion);
        }).to.throw('Invalid Argument');
      });
      var payloadWithIncorrectRegTxIdSize = validPayloadFixture.copy().setRegTxId('123');
      var payloadWithIncorrectHashSTPacketSize = validPayloadFixture.copy().setHashSTPacket('123');
      var payloadWithIncorrectCreditFee = validPayloadFixture.copy().setCreditFee(-10);
      var payloadWithIncorrectHashPrevSubTx = validPayloadFixture.copy().setHashPrevSubTx('123');
      var payloadWithIncorrectSignature = validPayloadFixture.copy();
      payloadWithIncorrectSignature.vchSig = 'signature';
      var payloadWithIncorrectSignatureSize = validPayloadFixture.copy();
      payloadWithIncorrectSignatureSize.vchSig = BufferUtil.emptyBuffer(10).toString('hex');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithIncorrectRegTxIdSize);
      }).to.throw('Invalid Argument: Invalid regTxId size');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithIncorrectHashSTPacketSize);
      }).to.throw('Invalid Argument: Invalid hashSTPacket size');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithIncorrectCreditFee);
      }).to.throw('Invalid Argument: Expect creditFee to be an unsigned integer');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithIncorrectHashPrevSubTx);
      }).to.throw('Invalid Argument: Invalid hashPrevSubTx size');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithIncorrectSignature);
      }).to.throw('Invalid Argument: expect vchSig to be a hex string');
      expect(function () {
        SubTxTransitionPayload.fromJSON(payloadWithIncorrectSignatureSize);
      }).to.throw('Invalid Argument: Invalid vchSig size');
    });
  });
  describe('#sign', function () {
    it('Should sign payload and return instance back if a private key is a string', function () {
      var payload = validPayloadFixture.copy().sign(privateKey);
      expect(payload.vchSig).to.be.a.string;
      expect(payload.vchSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE * 2);
    });
    it('Should sign payload and return instance back if a private key is an instance of PrivateKey', function () {
      var payload = validPayloadFixture.copy().sign(new PrivateKey(privateKey));
      expect(payload.vchSig).to.be.a.string;
      expect(payload.vchSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE * 2);
    });
    it('Should throw when trying to sign incomplete data', function () {
      var payload = validPayloadFixture.copy().setRegTxId('ffa2');

      expect(function () {
        payload.sign(privateKey);
      }).to.throw('Invalid Argument: Invalid regTxId size');
    });
  });
  describe('#verifySignature', function () {
    it('Should verify signature if pubKeyId is a Buffer', function () {
      var payload = validPayloadFixture.copy().sign(privateKey);
      expect(payload.verifySignature(pubKeyId)).to.be.true;
    });
    it('Should verify signature if pubKeyId is a hex string', function () {
      var payload = validPayloadFixture.copy().sign(privateKey);
      expect(payload.verifySignature(pubKeyId.toString('hex'))).to.be.true;
    });
    it('Should return false if pubKeyId doesn\'t match the signature', function () {
      var payload = validPayloadFixture.copy().sign(privateKey);
      expect(payload.verifySignature(new PrivateKey().toPublicKey()._getID())).to.be.false;
    });
  });
  describe('#toJSON', function () {
    it('Should return a JSON that contains same data as the payload instance', function () {
      var payload = validPayloadFixture.copy().sign(privateKey);
      var payloadJSON = payload.toJSON();
      expect(payloadJSON.version).to.be.equal(payload.version);
      expect(payloadJSON.hashPrevSubTx).to.be.deep.equal(payload.hashPrevSubTx);
      expect(payloadJSON.hashSTPacket).to.be.deep.equal(payload.hashSTPacket);
      expect(payloadJSON.regTxId).to.be.deep.equal(payload.regTxId);
      expect(payloadJSON.creditFee).to.be.equal(payload.creditFee);
      expect(payloadJSON.vchSig).to.be.deep.equal(payload.vchSig);
    });
    it('Should validate data before serialization', function () {
      var payload = validPayloadFixture.copy();
      var spy = sinon.spy(SubTxTransitionPayload, 'validatePayloadJSON');
      payload.toJSON();
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });
    it('Should skip signature if such option is passed', function () {
      var payload = validPayloadFixture.copy();

      var payloadJSON = payload.toJSON({ skipSignature: true });
      expect(payloadJSON).not.to.have.property('vchSig');
    });
  });
  describe('#toBuffer', function () {
    it('Should return a Buffer that contains same data as the payload instance', function () {
      var payload = validPayloadFixture.copy();
      var payloadBuffer = payload.toBuffer();

      var restoredPayload = SubTxTransitionPayload.fromBuffer(payloadBuffer);
      expect(restoredPayload).to.be.deep.equal(payload);
    });
    it('Should validate data before serialization', function () {
      var payload = validPayloadFixture.copy();
      var spy = sinon.spy(SubTxTransitionPayload, 'validatePayloadJSON');
      expect(spy.callCount).to.be.equal(0);
      payload.toBuffer();
      expect(spy.callCount).to.be.equal(1);
      spy.restore();
    });
  });
  describe('#getHash', function() {
    it('Should return deterministic hash', function () {
      var payload = validPayloadFixture.copy();

      var hash = payload.getHash();
      expect(hash).to.be.an.instanceOf(Buffer);
      expect(hash.length).to.be.equal(32);
      var hash2 = payload.getHash();
      expect(hash).to.be.deep.equal(hash2);
    });
    it('Should return hash without signature if option passed', function () {
      var payload = validPayloadFixture.copy().sign(privateKey);

      var hash = payload.getHash();
      var hashFromDataWithoutSignature = payload.getHash({ skipSignature: true });
      expect(hashFromDataWithoutSignature).to.be.an.instanceOf(Buffer);
      expect(hashFromDataWithoutSignature.length).to.be.equal(32);
      expect(hashFromDataWithoutSignature).to.be.not.deep.equal(hash);
    });
    it('Should validate data', function () {
      var payload = validPayloadFixture.copy();
      var spy = sinon.spy(SubTxTransitionPayload, 'validatePayloadJSON');
      payload.getHash();
      expect(spy.callCount).to.be.equal(1);
      spy.restore();
    });
  });
});