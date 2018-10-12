var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var ProRegTxPayload = DashcoreLib.Transaction.Payload.ProRegTxPayload;

var merkleRootMNList = 'e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
console.log(merkleRootMNList);

var validProRegTxPayloadJSON = {
  version : 1,
  protocolVersion : 70211,
  // 1.2.3.7 mapped to IPv6
  ipAddress : '00000000000000000000ffff01020307',
  port : 1237,
  keyIdOperator : '37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a',
  keyIdOwner : '37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a',
  keyIdVoting : '37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a',
  scriptPayout : '76a9146ba54a9548b7fb962e33114902234eeb93c7fd5c88ac',
  operatorReward : 1200,
  collateralIndex: 1,
  inputsHash : '0da72bc98991885d9e6f617a5b1fca526b03ef12691e9668741f6c8eaad6311e',
  payloadSig: '1f1260016c46818327d3267ccb2a52e616fa0caef5fc7fce468cd351233b3e364149905ae110e37ea5c06fcf60b8794fc2419004bbca2eba028694a7abe750497c'
};
var validProRegTxPayloadHexString = '0100431201000100000000000000000000000000ffff0102030704d537ab1f05addb051a4c618a3ccbd1ebd49fe2f60a37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a1976a9146ba54a9548b7fb962e33114902234eeb93c7fd5c88acb0040da72bc98991885d9e6f617a5b1fca526b03ef12691e9668741f6c8eaad6311e411f1260016c46818327d3267ccb2a52e616fa0caef5fc7fce468cd351233b3e364149905ae110e37ea5c06fcf60b8794fc2419004bbca2eba028694a7abe750497c';
var validProRegTxPayloadBuffer = Buffer.from(validProRegTxPayloadHexString, 'hex');
var validProRegTxPayload = ProRegTxPayload.fromBuffer(validProRegTxPayloadBuffer);

describe('ProRegTxPayload', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should return instance of ProRegTxPayload and call #validate on it', function() {
      var payload = ProRegTxPayload.fromBuffer(Buffer.from(validProRegTxPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffff01020307');
      expect(payload.port).to.be.equal(1237);
      expect(payload.protocolVersion).to.be.equal(70211);
      expect(payload.collateralIndex).to.be.equal(1);

      expect(payload.keyIdOperator).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(payload.keyIdOwner).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(payload.keyIdVoting).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');

      expect(new Script(payload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yW8dANZciyvr8QkxURPVbxaadzf2WFZnAw');

      expect(payload.operatorReward).to.be.equal(1200);
      expect(payload.inputsHash).to.be.equal('0da72bc98991885d9e6f617a5b1fca526b03ef12691e9668741f6c8eaad6311e');
      expect(payload.payloadSig).to.be.equal('1f1260016c46818327d3267ccb2a52e616fa0caef5fc7fce468cd351233b3e364149905ae110e37ea5c06fcf60b8794fc2419004bbca2eba028694a7abe750497c');
      // TODO: Add signature verification
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProRegTxPayloadHexString + '0000', 'hex');

      expect(function() {
        ProRegTxPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    it('Should return instance of ProRegTxPayload and call #validate on it', function() {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSON);

      expect(payload.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffff01020307');
      expect(payload.port).to.be.equal(1237);
      expect(payload.protocolVersion).to.be.equal(70211);
      expect(payload.collateralIndex).to.be.equal(1);

      expect(payload.keyIdOperator).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(payload.keyIdOwner).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(payload.keyIdVoting).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');

      expect(new Script(payload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yW8dANZciyvr8QkxURPVbxaadzf2WFZnAw');

      expect(payload.operatorReward).to.be.equal(1200);
      expect(payload.inputsHash).to.be.equal('0da72bc98991885d9e6f617a5b1fca526b03ef12691e9668741f6c8eaad6311e');
      expect(payload.payloadSig).to.be.equal('1f1260016c46818327d3267ccb2a52e616fa0caef5fc7fce468cd351233b3e364149905ae110e37ea5c06fcf60b8794fc2419004bbca2eba028694a7abe750497c');
      // TODO: Add signature verification
    });

    after(function () {
      ProRegTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProRegTxPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(payloadJSON.ipAddress).to.be.equal('00000000000000000000ffff01020307');
      expect(payloadJSON.port).to.be.equal(1237);
      expect(payloadJSON.protocolVersion).to.be.equal(70211);
      expect(payloadJSON.collateralIndex).to.be.equal(1);

      expect(payloadJSON.keyIdOperator).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(payloadJSON.keyIdOwner).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(payloadJSON.keyIdVoting).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');

      expect(new Script(payloadJSON.scriptPayout).toAddress('testnet').toString()).to.be.equal('yW8dANZciyvr8QkxURPVbxaadzf2WFZnAw');

      expect(payloadJSON.operatorReward).to.be.equal(1200);
      expect(payloadJSON.inputsHash).to.be.equal('0da72bc98991885d9e6f617a5b1fca526b03ef12691e9668741f6c8eaad6311e');
      expect(payloadJSON.payloadSig).to.be.equal('1f1260016c46818327d3267ccb2a52e616fa0caef5fc7fce468cd351233b3e364149905ae110e37ea5c06fcf60b8794fc2419004bbca2eba028694a7abe750497c');

    });
    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSON);
      ProRegTxPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProRegTxPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = ProRegTxPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(restoredPayload.ipAddress).to.be.equal('00000000000000000000ffff01020307');
      expect(restoredPayload.port).to.be.equal(1237);
      expect(restoredPayload.protocolVersion).to.be.equal(70211);
      expect(restoredPayload.collateralIndex).to.be.equal(1);

      expect(restoredPayload.keyIdOperator).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(restoredPayload.keyIdOwner).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');
      expect(restoredPayload.keyIdVoting).to.be.equal('37ab1f05addb051a4c618a3ccbd1ebd49fe2f60a');

      expect(new Script(restoredPayload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yW8dANZciyvr8QkxURPVbxaadzf2WFZnAw');

      expect(restoredPayload.operatorReward).to.be.equal(1200);
      expect(restoredPayload.inputsHash).to.be.equal('0da72bc98991885d9e6f617a5b1fca526b03ef12691e9668741f6c8eaad6311e');

      expect(restoredPayload.payloadSig).to.be.equal('1f1260016c46818327d3267ccb2a52e616fa0caef5fc7fce468cd351233b3e364149905ae110e37ea5c06fcf60b8794fc2419004bbca2eba028694a7abe750497c');

      expect(restoredPayload.toBuffer().toString('hex')).to.be.equal(validProRegTxPayloadHexString);
    });
    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSON);
      ProRegTxPayload.prototype.validate.reset();
      payload.toBuffer();
      console.log(payload.validate.callCount);
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});