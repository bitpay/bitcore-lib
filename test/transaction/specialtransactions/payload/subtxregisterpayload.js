var expect = require('chai').expect;

var DashcoreLib = require('../../../../index');

var SpecialTransactions = DashcoreLib.Transaction.SpecialTransactions;
var Payload = SpecialTransactions.payload;
var SubTxRegisterPayload = Payload.SubTxRegisterPayload;

describe('SubTxRegisterPayload', function() {
  describe('#constructor', function () {
    it('Should create SubTxRegisterPayload instance', function () {
      var payload = new SubTxRegisterPayload();
      expect(payload).to.have.property('nVersion');
    });
  });
  describe('parsePayloadBuffer', function () {
    it('Should return instance of SubTxRegisterPayload with parsed data', function () {
      throw new Error('Not implemented');
    });
    it('Should throw an error if data is incomplete', function () {
      throw new Error('Not implemented');
    });
    it('Should throw an error if data is incorrect', function () {
      throw new Error('Not implemented');
    });
  });
  describe('parsePayloadJSON', function () {
    it('Should return instance of SubTxRegisterPayload with parsed data', function () {
      throw new Error('Not implemented');
    });
    it('Should throw an error if data is incomplete', function () {
      throw new Error('Not implemented');
    });
    it('Should throw an error if data is incorrect', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#setUserName', function () {
    it('Should set username and return instance back', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#setPubKeyId', function () {
    it('Should set pubKeyId and return instance back', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#setPubKeyIdFromPrivateKey', function () {
    it('Should set pubKeyId and return instance back', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#sign', function () {
    it('Should sign payload and return instance back', function () {
      throw new Error('Not implemented');
    });
  });
  describe('#verifySignature', function () {
    it('Should verify signature', function () {
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