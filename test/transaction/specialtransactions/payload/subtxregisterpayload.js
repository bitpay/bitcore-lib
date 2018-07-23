var expect = require('chai').expect;

var DashcoreLib = require('../../../../index');

var PrivateKey = DashcoreLib.PrivateKey;
var BufferUtil = DashcoreLib.util.buffer;
var SpecialTransactions = DashcoreLib.Transaction.SpecialTransactions;
var Payload = SpecialTransactions.payload;
var SubTxRegisterPayload = Payload.SubTxRegisterPayload;

var CORRECT_SIGNATURE_SIZE = SpecialTransactions.constants.SUBTXREGISTER_SIGNATURE_SIZE;
var privateKey = 'cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY';
var pubKeyId = new PrivateKey(privateKey).toPublicKey()._getID();

describe('SubTxRegisterPayload', function() {

  describe('constructor', function () {
    it('Should create SubTxRegisterPayload instance', function () {
      var payload = new SubTxRegisterPayload();
      expect(payload).to.have.property('nVersion');
    });
  });
  describe('parsePayloadBuffer', function () {
    it('Should return instance of SubTxRegisterPayload with parsed data', function () {
      var payloadBuffer = new SubTxRegisterPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .toBuffer();

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = SubTxRegisterPayload.parsePayloadBuffer(payloadBuffer);
      expect(parsedPayload.userName).to.be.equal('test');
      expect(BufferUtil.equals(parsedPayload.pubKeyId, pubKeyId)).to.be.true;

    });
    it('Should throw an error if data is incomplete', function () {
      var payloadBuffer = new SubTxRegisterPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .toBuffer();
      // 2 bytes is payload version, 1 is username size
      var payloadBufferWithoutPubKeyId = payloadBuffer.slice(0, 2 + 1 + Buffer.from('test').length);
      expect(payloadBufferWithoutPubKeyId.length).to.be.equal(payloadBuffer.length - SpecialTransactions.constants.PUBKEY_ID_SIZE);

      expect(function () {
        SubTxRegisterPayload.parsePayloadBuffer(payloadBufferWithoutPubKeyId)
      }).to.throw('Invalid pubKeyId size');
    });
  });
  describe('parsePayloadJSON', function () {
    it('Should return instance of SubTxRegisterPayload with correct parsed data', function () {
      var payloadJSON = {
        nVersion: 10,
        userName: 'test',
        pubKeyId: pubKeyId,
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payload = SubTxRegisterPayload.parsePayloadJSON(payloadJSON);
      expect(payload.nVersion).to.be.equal(10);
      expect(payload.userName).to.be.equal('test');
      expect(BufferUtil.equals(payload.pubKeyId, payloadJSON.pubKeyId)).to.be.true;
      expect(BufferUtil.equals(payload.vchSig, payloadJSON.vchSig)).to.be.true;
    });
    it('Should throw an error if the data is incomplete', function () {
      var payloadWithoutUserName = {
        nVersion: 10,
        pubKeyId: pubKeyId,
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithoutPubKeyId = {
        nVersion: 10,
        userName: 'test',
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithoutVersion = {
        userName: 'test',
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE),
        pubKeyId: pubKeyId
      };
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithoutUserName);
      }).to.throw('Invalid Argument for userName, expected string but got undefined');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithoutPubKeyId);
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got undefined');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithoutVersion);
      }).to.throw('Invalid Argument for nVersion, expected number but got undefined');
    });
    it('Should throw an error if the data is incorrect', function () {
      var payloadWithIncorrectUsername = {
        nVersion: 10,
        userName: 10,
        pubKeyId: pubKeyId,
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithIncorrectPubKeyId = {
        nVersion: 10,
        userName: 'test',
        pubKeyId: 'pubKeyId',
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithIncorrectPubKeyIdSize = {
        nVersion: 10,
        userName: 'test',
        pubKeyId: BufferUtil.emptyBuffer(46),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithIncorrectVersion = {
        nVersion: '10',
        userName: 'test',
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE),
        pubKeyId: pubKeyId
      };
      var payloadWithIncorrectSignature = {
        nVersion: 10,
        userName: 'test',
        vchSig: 'signature',
        pubKeyId: pubKeyId
      };
      var payloadWithIncorrectSignatureSize = {
        nVersion: 10,
        userName: 'test',
        vchSig: BufferUtil.emptyBuffer(28),
        pubKeyId: pubKeyId
      };
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithIncorrectUsername);
      }).to.throw('Invalid Argument for userName, expected string but got number');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithIncorrectPubKeyId);
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got string');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithIncorrectPubKeyIdSize);
      }).to.throw('Invalid Argument: Invalid pubKeyId size');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithIncorrectVersion);
      }).to.throw('Invalid Argument for nVersion, expected number but got string');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithIncorrectSignature);
      }).to.throw('Invalid Argument: expect vchSig to be a Buffer but got string');
      expect(function () {
        SubTxRegisterPayload.parsePayloadJSON(payloadWithIncorrectSignatureSize);
      }).to.throw('Invalid Argument: Invalid vchSig size');
    });
  });
  describe('#setUserName', function () {
    it('Should set username and return instance back', function () {
      var payload = new SubTxRegisterPayload()
        .setUserName('test');

      expect(payload).to.be.an.instanceOf(SubTxRegisterPayload);
      expect(payload.userName).to.be.equal('test');
    });
  });
  describe('#setPubKeyId', function () {
    it('Should set pubKeyId and return instance back', function () {
      var payload = new SubTxRegisterPayload()
        .setPubKeyId(pubKeyId);

      expect(payload).to.be.an.instanceOf(SubTxRegisterPayload);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
    });
  });
  describe('#setPubKeyIdFromPrivateKey', function () {
    it('Should set pubKeyId and return instance back if private key is a string', function () {
      var payload = new SubTxRegisterPayload()
        .setPubKeyIdFromPrivateKey(privateKey);

      expect(payload).to.be.an.instanceOf(SubTxRegisterPayload);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
    });
    it('Should set pubKeyId and return instance back if private key is an instance of PrivateKey', function () {
      var payload = new SubTxRegisterPayload()
        .setPubKeyIdFromPrivateKey(new PrivateKey(privateKey));

      expect(payload).to.be.an.instanceOf(SubTxRegisterPayload);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
    });
  });
  describe('#sign', function () {
    it('Should sign payload and return instance back if a private key is a string', function () {
      var payload = new SubTxRegisterPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);
      expect(payload.vchSig).to.be.an.instanceOf(Buffer);
      expect(payload.vchSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE);
    });
    it('Should sign payload and return instance back if a private key is an instance of PrivateKey', function () {
      var payload = new SubTxRegisterPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(new PrivateKey(privateKey));
      expect(payload.vchSig).to.be.an.instanceOf(Buffer);
      expect(payload.vchSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE);
    });
    it('Should throw when trying to sign incomplete data', function () {
      var payload = new SubTxRegisterPayload()
        .setUserName('test');

      expect(function () {
        payload.sign(privateKey);
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got undefined');
    });
  });
  describe('#verifySignature', function () {
    it('Should verify signature if a private key is a string', function () {
      throw new Error('Not implemented');
    });
    it('Should verify signature if a private key is an instance of PrivateKey', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#toJSON', function () {
    it('Should return a JSON that contains same data as the payload instance', function () {
      throw new Error('Not implemented');
    });
    it('Should throw if data is incomplete', function () {
      throw new Error('Not implemented');
    });
    it('Should throw if data is invalid', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#toBuffer', function () {
    it('Should return a Buffer that contains same data as the payload instance', function () {
      throw new Error('Not implemented');
    });
    it('Should throw if data is incomplete', function () {
      throw new Error('Not implemented');
    });
    it('Should throw if data is invalid', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#getHash', function() {
    it('Should return hash', function () {
      throw new Error('Not implemented');
    });
    it('Should return hash without signature if option passed', function () {
      throw new Error('Not implemented');
    });
    it('Should throw if data is incomplete', function () {
      throw new Error('Not implemented');
    });
  });
});