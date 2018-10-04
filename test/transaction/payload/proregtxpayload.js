var expect = require('chai').expect;

var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProRegTxPayload = Payload.ProRegTxPayload;

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
        collateralIndex: 1,
        ipAddress: '0000:0000:0000:0000:0000:ffff:c0a8:0001', //192.168.0.1
        port: 10000,
        KeyIdOwner: '4d5fce2325deb034ae75a625a3e2f09395e27bf7',
        KeyIdOperator: '4d5fce2325deb034ae75a625a3e2f09395e27bf7',
        KeyIdVoting: '4d5fce2325deb034ae75a625a3e2f09395e27bf7',
        operatorReward: 100,
        scriptPayout: 'deb034ae',
        inputsHash: 'a6f7b4284fb753eab9b554283c4fe1f1d7e143e6cf3b975d0376d7c08ba4cdf5',
        payloadSig: '48d6a1bd2cd9eec54eb866fc71209418a950402b5d7e52363bfb75c98e141175',
      }

      var payloadBuffer = new ProRegTxPayload(options).toBuffer();
      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = ProRegTxPayload.fromBuffer(payloadBuffer);
      for (var key in options) {
        expect(parsedPayload[key]).to.be.equal(options[key]);
      }

    });


    it('Should throw an error if data is incomplete', function () {
      //todo
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