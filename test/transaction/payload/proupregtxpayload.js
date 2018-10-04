var expect = require('chai').expect;

var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProUpRegTxPayload = Payload.ProUpRegTxPayload;

describe('ProUpRegTxPayload', function () {

  describe('#constructor', function () {
    it('Should create ProUpRegTxPayload instance', function () {
      var payload = new ProUpRegTxPayload();
      expect(payload).to.have.property('version');
    });
  });

  describe('fromBuffer', function () {
    it('Should return instance of ProUpRegTxPayload with parsed data', function () {
      // TODO: Implement this
      var options = {};

      var payloadBuffer = new ProUpRegTxPayload(options).toBuffer();
      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = ProUpRegTxPayload.fromBuffer(payloadBuffer);
      for (var key in options) {
        expect(parsedPayload[key]).to.be.equal(options[key]);
      }

    });


    it('Should throw an error if data is incomplete', function () {
      // TODO: Implement this
    });
  });

  describe('fromJSON', function () {
    // TODO: Implement this
  });

  describe('#toJSON', function () {
    // TODO: Implement this
  });
  describe('#toBuffer', function () {
    // TODO: Implement this
  });

});
