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
    throw new Error('Not implemented');
  });
  describe('parsePayloadJSON', function () {
    throw new Error('Not implemented');
  });
  describe('#setUserName', function () {
    throw new Error('Not implemented');
  });
  describe('#setPubKeyId', function () {
    throw new Error('Not implemented');
  });
  describe('#setPubKeyIdFromPrivateKey', function () {
    throw new Error('Not implemented');
  });
  describe('#sign', function () {
    throw new Error('Not implemented');
  });
  describe('#verifySignature', function () {
    throw new Error('Not implemented');
  });
  describe('#toJSON', function () {
    throw new Error('Not implemented');
  });
  describe('#toBuffer', function () {
    throw new Error('Not implemented');
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