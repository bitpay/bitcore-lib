var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var CommitmentTxPayload = DashcoreLib.Transaction.Payload.CommitmentTxPayload;

var merkleRootMNList = 'e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
console.log(merkleRootMNList);

var validCommitmentTxPayloadJSON = {
  version: 1,
  quorumHash: '723d90a45fd882f0df01a56ee1e83f45d03522f390aae5b7f1273745bf2446fd',
  signersSize: 9,
  signers: 'f01a',
  validMembersSize: 9,
  validMembers: 'f991',
  quorumPublicKey: 'ae5b7f1273724463d90a01a56e45f3d90a01a56e45fd8fd45d03522f390aae5b7f12737244682f0df72e1e83f45bffd5',
  quorumVvecHash: '45fd882f0df723d90a01a56ee1e83f45bf2446fd45d03522f390aae5b7f12737',
  quorumSig: '3d90a01a56e45fd882f0df72e1e83f45bffd45d03522f390aae5b7f12737241a56e45fd882f0df01a56e45fd882f0df72e1e83f45bffd45d03522f390aae5b7f1273724461a56e45fd882f0df1a56e45fd882f0df1a56e45fd881a56e452f0df',
  sig: 'd45d03522f45fd82446f390aae5b7f1273782f0df723d90a01a56ee1e83f45bfd45d03522f45fd82446f390aae5b7f1273782f0df723d90a01a56ee1e83f45bfd45d03522f45fd82446f390aae5b7f1273782f0df723d90a01a56ee1e83f45bf',
};

// Todo after commitement tx implemnetation done in core
// var validCommitmentTxPayloadHexString = ''
// var payload = CommitmentTxPayload.fromBuffer(Buffer.from(validCommitmentTxPayloadHexString, 'hex'));

function checkValidJSON(payload) {
  expect(payload.version).to.be.equal(validCommitmentTxPayloadJSON.version);
  expect(payload.quorumHash).to.be.equal(validCommitmentTxPayloadJSON.quorumHash);
  expect(payload.signers).to.be.equal(validCommitmentTxPayloadJSON.signers);
  expect(payload.validMembers).to.be.equal(validCommitmentTxPayloadJSON.validMembers);
  expect(payload.quorumPublicKey).to.be.equal(validCommitmentTxPayloadJSON.quorumPublicKey);
  expect(payload.quorumVvecHash).to.be.equal(validCommitmentTxPayloadJSON.quorumVvecHash);
  expect(payload.quorumSig).to.be.equal(validCommitmentTxPayloadJSON.quorumSig);
  expect(payload.sig).to.be.equal(validCommitmentTxPayloadJSON.sig);
}

describe('CommitmentTxPayload', function () {

  var payload = null;
  var payloadBuffer = null;

  describe('.fromJSON', function () {

    beforeEach(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should return instance of CommitmentTxPayload and call #validate on it', function () {
      payload = CommitmentTxPayload.fromJSON(validCommitmentTxPayloadJSON);
      checkValidJSON(payload);
    });
  });

  describe('.toBuffer', function () {
    before(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    it('Should return payload buffer of specific length', function () {

      //Manually calculated from validCommitmentTxPayloadJSON
      var expectedBufferLength = 312;

      payloadBuffer = payload.toBuffer();
      expect(payloadBuffer.length).to.be.equal(expectedBufferLength);
    });

    after(function () {
      CommitmentTxPayload.prototype.validate.restore();
    })
  });

  describe('.fromBuffer', function () {
    before(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    it('Should return payload from buffer', function () {
      var payloadFromBuffer = CommitmentTxPayload.fromBuffer(payloadBuffer);
      checkValidJSON(payloadFromBuffer);
    });

    after(function () {
      CommitmentTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payloadJSON = payload.toJSON();
      checkValidJSON(payloadJSON);
    });
  });
});