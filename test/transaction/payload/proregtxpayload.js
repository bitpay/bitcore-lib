var expect = require('chai').expect;

var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProRegTxPayload = Payload.ProRegTxPayload;

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

var fullhex = `0300010003a966c289061610196f43ec4f95192d62864ede64fa4ce5d5c905e1a9200855200000000049483045022100927551e57f3a20e73187b0dd60ca44c0f86e9c63e365b24d2c4dfa79d13075a80220475a615791b52592bfb7165ab1319897aea44d779ea0dd84f35de1336663137401fefffffff64c5645b70855061b477f45d0816564b168fb5dcf038cb83cf085e7e88aa8390000000048473044022074a7afff9ed3bf04ed3f99fa5d59cce7f5e9c4332a3ade32ead195ee0784e54e02202fdf6af49a638b0b0a59cbcad1ea049b67cda22e758b8cdfafadeaec8f2077f401feffffffba08bfaff3611d7b2d97c50cd40cf2967dc7c22073addba8e91215b494cc514e0000000048473044022065048cfe9e4d9ffbdc32a40b029d46e8a221c911a8228ea157ddddf5689cab32022040e4985fd0fb9aedb4b5ab6ec255ea4026e8098e6f74944c03344bfbbf7d908201feffffff02857f357a0a0000001976a914e4d5a109661155a616f05b1a0b2c95221ca0c23388ac00e87648170000001976a91496dc3875f032c9439c4b1e4c3c9ddbd8a9c9594888ac00000000d60100431201000100000000000000000000000000ffff9f596eb84e1f8ce053db1d2dca51baa435e4dbf104dc1c0bd9038ce053db1d2dca51baa435e4dbf104dc1c0bd9038ce053db1d2dca51baa435e4dbf104dc1c0bd9031976a91496dc3875f032c9439c4b1e4c3c9ddbd8a9c9594888ac000017720491c12b97c956257e6865eca1196956eda35fe3dd42e6949019a42a410b411ba498c1a8781be5dab5e9afec7d0b69cb78608ddc93cf8441d3d274b64bce091936f48a8d779ac3e8da6828486f7df21c3c12b7e1ef84b1de4172001ce47fa5de`;

var Transaction = DashcoreLib.Transaction;
var testTx = new Transaction(fullhex);

var validProRegTxPayload = `0100000000000000000000000000ffff9f596eb84e1f8ce053db1d2dca51baa435e4dbf104dc1c0bd9038ce053db1d2dca51baa435e4db7720491c12b97c956257e6865eca1196956eda35fe3dd42e6949019a42a410b411ba498c1a8781be5dab5e9afec7d0b69cb78608ddc93cf8441d3d274b64bce091936f48a8d779ac3e8da6828486f7df21c3c12b7e1ef84b1de4172001ce47fa5de`


describe('ProRegTxPayload', function () {

  describe('constructor', function () {
    it('Should create ProRegTxPayload instance', function () {
      var payload = new ProRegTxPayload();
      expect(payload).to.have.property('version');
    });
  });

  describe('from-/to- Buffer', function () {
    it('Should return instance of ProRegTxPayload with parsed data', function () {

      var parsed = ProRegTxPayload.fromBuffer(validProRegTxPayload);

      var payloadBuffer = new ProRegTxPayload(options).toBuffer();
      expect(BufferUtil.isBuffer(payloadBuffer)).to.be.true;

      var parsedPayload = ProRegTxPayload.fromBuffer(payloadBuffer);
      for (var key in options) {
        expect(parsedPayload[key]).to.be.equal(options[key]);
      }
    });
  });

  describe('from- / to- JSON', function () {
    it('Should parse JSON', function () {

      options.version = 1;
      var payloadObj = ProRegTxPayload.fromJSON(options);
      var jsonFromPayload = payloadObj.toJSON();

      for (var key in jsonFromPayload) {
        expect(jsonFromPayload[key]).to.be.equal(options[key]);
      }
    });
  });

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  describe('Validation', function () {
    it('should invalidate for missing values', function () {

      var tmpOptions = deepCopy(options)
      delete tmpOptions.version;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect version to be an unsigned integer`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.type;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect type to be an unsigned integer`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.mode;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect mode to be an unsigned integer`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.collateralIndex;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect collateralIndex to be an unsigned integer`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.ipAddress;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Expect ipAddress to be a string`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.port;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Expect port to be an unsigned integer`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.KeyIdOwner;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect KeyIdOwner to be a hex string`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.KeyIdOperator;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect KeyIdOperator to be a hex string`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.KeyIdVoting;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect KeyIdVoting to be a hex string`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.operatorReward;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect operatorReward to be an unsigned integer`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.scriptPayout;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect scriptPayout to be a hex string`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.inputsHash;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`Invalid Argument: Expect inputsHash to be a hex string`);

      var tmpOptions = deepCopy(options)
      delete tmpOptions.payloadSig;
      expect(function () {
        ProRegTxPayload.fromJSON(tmpOptions);
      }).to.throw(`nvalid Argument: Expect payloadSig to be a hex string`);
   
    });
  });

});