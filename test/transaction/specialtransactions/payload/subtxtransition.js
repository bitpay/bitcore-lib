var expect = require('chai').expect;

var DashcoreLib = require('../../../../index');

var PrivateKey = DashcoreLib.PrivateKey;
var BufferUtil = DashcoreLib.util.buffer;
var SpecialTransactions = DashcoreLib.Transaction.SpecialTransactions;
var Payload = SpecialTransactions.payload;
var SubTxTransitionPayload = Payload.SubTxTransitionPayload;
var HashUtil = DashcoreLib.util.hashUtil;

var CORRECT_SIGNATURE_SIZE = SpecialTransactions.constants.COMPACT_SIGNATURE_SIZE;
var privateKey = 'cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY';
var pubKeyId = new PrivateKey(privateKey).toPublicKey()._getID();

describe('SubTxTransitionPayload', function() {

  describe('constructor', function () {
    it('Should create SubTxTransitionPayload instance', function () {
      var payload = new SubTxTransitionPayload();
      expect(payload).to.have.property('nVersion');
    });
  });

  describe('#setRegTxId', function () {
    it('Should set regTxId and return instance back', function () {
      var regTxId = HashUtil.getRandomHash();

      var payload = new SubTxTransitionPayload()
        .setRegTxId(regTxId);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.regTxId).to.be.deep.equal(regTxId);
    });
  });

  describe('#setHashPrevSubTx', function () {
    it('Should set hashPrevSubTx and return instance back', function () {
      var hashPrevSubTx = HashUtil.getRandomHash();

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
      var hashSTPacket = HashUtil.getRandomHash();

      var payload = new SubTxTransitionPayload()
        .setHashSTPacket(hashSTPacket);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.hashSTPacket).to.be.deep.equal(hashSTPacket);
    });
  });

  describe('parsePayloadBuffer', function () {
    it('Should return instance of SubTxTransitionPayload with parsed data', function () {
      var hashPrevSubTx = HashUtil.getRandomHash();
      var regTxId = HashUtil.getRandomHash();
      var hashSTPacket = HashUtil.getRandomHash();

      var payload = new SubTxTransitionPayload()
        .setHashPrevSubTx(hashPrevSubTx)
        .setCreditFee(10)
        .setRegTxId(regTxId)
        .setHashSTPacket(hashSTPacket);

      var payloadBuffer = payload.toBuffer();

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = SubTxTransitionPayload.parsePayloadBuffer(payloadBuffer);
      expect(parsedPayload.hashPrevSubTx).to.be.deep.equal(hashPrevSubTx);
      expect(parsedPayload.regTxId).to.be.deep.equal(regTxId);
      expect(parsedPayload.hashSTPacket).to.be.deep.equal(hashSTPacket);
      expect(parsedPayload.creditFee).to.be.equal(10);
      expect(parsedPayload.nVersion).to.be.equal(payload.nVersion);
    });
    it('Should throw an error if data is incomplete', function () {
      var hashPrevSubTx = HashUtil.getRandomHash();
      var regTxId = HashUtil.getRandomHash();
      var hashSTPacket = HashUtil.getRandomHash();

      var payload = new SubTxTransitionPayload()
        .setHashPrevSubTx(hashPrevSubTx)
        .setCreditFee(10)
        .setRegTxId(regTxId)
        .setHashSTPacket(hashSTPacket);

      var payloadBuffer = payload.toBuffer();
      payloadBuffer = payloadBuffer.slice(0, payloadBuffer.length - 32);

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      expect(function () {
        SubTxTransitionPayload.parsePayloadBuffer(payloadBuffer);
      }).to.throw('Invalid Argument');
    });
  });
  describe('parsePayloadJSON', function () {
    it('Should return instance of SubTxTransitionPayload with correct parsed data', function () {
      var payloadJSON = {
        nVersion: 10,
        creditFee: 100,
        hashPrevSubTx: HashUtil.getRandomHash(),
        regTxId: HashUtil.getRandomHash(),
        hashSTPacket: HashUtil.getRandomHash(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payload = SubTxTransitionPayload.parsePayloadJSON(payloadJSON);
      expect(payload.nVersion).to.be.equal(10);
      expect(payload.creditFee).to.be.equal(100);
      expect(payload.hashPrevSubTx).to.be.deep.equal(payloadJSON.hashPrevSubTx);
      expect(payload.hashSTPacket).to.be.deep.equal(payloadJSON.hashSTPacket);
      expect(payload.regTxId).to.be.deep.equal(payloadJSON.regTxId);
      expect(payload.creditFee).to.be.deep.equal(payloadJSON.creditFee);
    });
    it('Should throw an error if the data is incomplete', function () {
      var payloadWithoutHashPrevSubTx = {
        nVersion: 10,
        creditFee: 100,
        regTxId: HashUtil.getRandomHash(),
        hashSTPacket: HashUtil.getRandomHash(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithoutRegTxId = {
        nVersion: 10,
        creditFee: 100,
        hashPrevSubTx: HashUtil.getRandomHash(),
        hashSTPacket: HashUtil.getRandomHash(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithoutHashSTPacket = {
        nVersion: 10,
        creditFee: 100,
        hashPrevSubTx: HashUtil.getRandomHash(),
        regTxId: HashUtil.getRandomHash(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      var payloadWithoutCreditFee = {
        nVersion: 10,
        hashPrevSubTx: HashUtil.getRandomHash(),
        hashSTPacket: HashUtil.getRandomHash(),
        regTxId: HashUtil.getRandomHash(),
        vchSig: BufferUtil.emptyBuffer(CORRECT_SIGNATURE_SIZE)
      };
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithoutHashPrevSubTx);
      }).to.throw('Invalid Argument: expect hashPrevSubTx to be a Buffer but got undefined');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithoutRegTxId);
      }).to.throw('Invalid Argument: expect regTxId to be a Buffer but got undefined');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithoutHashSTPacket);
      }).to.throw('Invalid Argument: expect hashSTPacket to be a Buffer but got undefined');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithoutCreditFee);
      }).to.throw('Invalid Argument for creditFee, expected number but got undefined');

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
        SubTxTransitionPayload.parsePayloadJSON(payloadWithIncorrectUsername);
      }).to.throw('Invalid Argument for userName, expected string but got number');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithIncorrectPubKeyId);
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got string');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithIncorrectPubKeyIdSize);
      }).to.throw('Invalid Argument: Invalid pubKeyId size');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithIncorrectVersion);
      }).to.throw('Invalid Argument for nVersion, expected number but got string');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithIncorrectSignature);
      }).to.throw('Invalid Argument: expect vchSig to be a Buffer but got string');
      expect(function () {
        SubTxTransitionPayload.parsePayloadJSON(payloadWithIncorrectSignatureSize);
      }).to.throw('Invalid Argument: Invalid vchSig size');
    });
  });
  describe('#setUserName', function () {
    it('Should set username and return instance back', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test');

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.userName).to.be.equal('test');
    });
  });
  describe('#setPubKeyId', function () {
    it('Should set pubKeyId and return instance back', function () {
      var payload = new SubTxTransitionPayload()
        .setPubKeyId(pubKeyId);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
    });
  });
  describe('#setPubKeyIdFromPrivateKey', function () {
    it('Should set pubKeyId and return instance back if private key is a string', function () {
      var payload = new SubTxTransitionPayload()
        .setPubKeyIdFromPrivateKey(privateKey);

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
    });
    it('Should set pubKeyId and return instance back if private key is an instance of PrivateKey', function () {
      var payload = new SubTxTransitionPayload()
        .setPubKeyIdFromPrivateKey(new PrivateKey(privateKey));

      expect(payload).to.be.an.instanceOf(SubTxTransitionPayload);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
    });
  });
  describe('#sign', function () {
    it('Should sign payload and return instance back if a private key is a string', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);
      expect(payload.vchSig).to.be.an.instanceOf(Buffer);
      expect(payload.vchSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE);
    });
    it('Should sign payload and return instance back if a private key is an instance of PrivateKey', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(new PrivateKey(privateKey));
      expect(payload.vchSig).to.be.an.instanceOf(Buffer);
      expect(payload.vchSig.length).to.be.equal(CORRECT_SIGNATURE_SIZE);
    });
    it('Should throw when trying to sign incomplete data', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test');

      expect(function () {
        payload.sign(privateKey);
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got undefined');
    });
  });
  describe('#verifySignature', function () {
    it('Should verify signature if pubKeyId is a Buffer', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      expect(payload.verifySignature(pubKeyId)).to.be.true;
    });
    it('Should verify signature if pubKeyId is a hex string', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      expect(payload.verifySignature(pubKeyId.toString('hex'))).to.be.true;
    });
    it('Should return false if pubKeyId doesn\'t match the signature', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      expect(payload.verifySignature(new PrivateKey().toPublicKey()._getID())).to.be.false;
    });
  });
  describe('#toJSON', function () {
    it('Should return a JSON that contains same data as the payload instance', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      var payloadJSON = payload.toJSON();
      expect(payload.userName).to.be.equal(payloadJSON.userName);
      expect(payload.pubKeyId).to.be.deep.equal(pubKeyId);
      expect(payload.vchSig).to.be.an.deep.equal(payload.vchSig);
    });
    it('Should throw if the data is incomplete', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test');

      expect(function () {
        payload.toJSON();
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got undefined');
    });
    it('Should throw if the data is invalid', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName(4)
        .setPubKeyId(pubKeyId);

      expect(function () {
        payload.toJSON();
      }).to.throw('Invalid Argument for userName, expected string but got number');
    });
    it('Should skip signature if such option is passed', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      var payloadJSON = payload.toJSON({ skipSignature: true });
      expect(payloadJSON).not.have.a.property('vchSig');
    });
  });
  describe('#toBuffer', function () {
    it('Should return a Buffer that contains same data as the payload instance', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      var payloadBuffer = payload.toBuffer();

      var restoredPayload = SubTxTransitionPayload.parsePayloadBuffer(payloadBuffer);
      expect(restoredPayload.nVersion).to.be.equal(payload.nVersion);
      expect(restoredPayload.userName).to.be.equal(payload.userName);
      expect(restoredPayload.pubKeyId).to.be.deep.equal(payload.pubKeyId);
      expect(restoredPayload.vchSig).to.be.deep.equal(payload.vchSig);
    });
    it('Should throw if the data is incomplete', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test');

      expect(function () {
        payload.toBuffer();
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got undefined');
    });
    it('Should throw if the data is invalid', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName(4)
        .setPubKeyId(pubKeyId);

      expect(function () {
        payload.toBuffer();
      }).to.throw('Invalid Argument for userName, expected string but got number');
    });
  });
  describe('#getHash', function() {
    it('Should return hash', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      var hash = payload.getHash();
      expect(hash).to.be.an.instanceOf(Buffer);
      expect(hash.length).to.be.equal(32);
    });
    it('Should return hash without signature if option passed', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .sign(privateKey);

      var hash = payload.getHash();
      var hashFromDataWithoutSignature = payload.getHash({ skipSignature: true });
      expect(hashFromDataWithoutSignature).to.be.an.instanceOf(Buffer);
      expect(hashFromDataWithoutSignature.length).to.be.equal(32);
      expect(hashFromDataWithoutSignature).to.be.not.deep.equal(hash);
    });
    it('Should throw if data is incomplete', function () {
      var payload = new SubTxTransitionPayload()
        .setUserName('test');

      expect(function() {
        payload.getHash();
      }).to.throw('Invalid Argument: expect pubKeyId to be a Buffer but got undefined');
    });
  });
});