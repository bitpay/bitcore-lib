var expect = require('chai').expect;

var DashcoreLib = require('../../..');

var PrivateKey = DashcoreLib.PrivateKey;
var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProRegTxPayload = Payload.ProRegTxPayload;
var isHexString = DashcoreLib.util.js.isHexaString;

describe('ProRegTxPayload', function () {

  describe('constructor', function () {
    it('Should create ProRegTxPayload instance', function () {
      var payload = new ProRegTxPayload();
      expect(payload).to.have.property('version');
    });
  });
  describe('fromBuffer', function () {
    it('Should return instance of ProRegTxPayload with parsed data', function () {

      var options = {
        type: 1,
        mode: 2,
        collateralIndex: 3,
        ipAddress: '100.225.225.1',
        port: 10000,
        KeyIdOwner: 'aaa143e6cf3b975d0376',
        KeyIdOperator: 'bbb143e6cf3b975d0376',
        KeyIdVoting: 'ccc143e6cf3b975d0376',
        operatorReward: 100,
        scriptPayoutSize: 1234,
        scriptPayout: 101,
        inputsHash: 'a6f7b4284fb753eab9b554283c4fe1f1d7e143e6cf3b975d0376d7c08ba4cdf5',
        payloadSigSize: 1024,
        payloadSig: '48d6a1bd2cd9eec54eb866fc71209418a950402b5d7e52363bfb75c98e141175',
      }

      var payloadBuffer = new ProRegTxPayload(options).toBuffer();

      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = ProRegTxPayload.fromBuffer(payloadBuffer);
      expect(parsedPayload.userName).to.be.equal('test');
      expect(BufferUtil.equals(parsedPayload.pubKeyId, pubKeyId)).to.be.true;

    });


    it('Should throw an error if data is incomplete', function () {
      var payloadBuffer = new SubTxRegisterPayload()
        .setUserName('test')
        .setPubKeyId(pubKeyId)
        .toBuffer();
      // 2 bytes is payload version, 1 is username size, 2 is sig size and zero signature
      var payloadBufferWithoutPubKeyId = payloadBuffer.slice(0, 2 + 1 + Buffer.from('test').length + 2);

      expect(function () {
        SubTxRegisterPayload.fromBuffer(payloadBufferWithoutPubKeyId)
      }).to.throw();
    });
  });

  describe('fromJSON', function () {
    //todo
  });

  describe('#toJSON', function () {
    //todo
  });
  describe('#toBuffer', function () {
    //todo
  });

});