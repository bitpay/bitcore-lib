var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
var BigNumber = require('bn.js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var CKEYID_SIZE = constants.PUBKEY_ID_SIZE;

/**
 * @typedef {Object} ProUpRegTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTXHash
 * @property {number} mode
 * @property {string} keyIdOperator
 * @property {string} keyIdVoting
 * @property {number} scriptPayoutSize
 * @property {string} scriptPayout
 * @property {number} payloadSigSize
 * @property {string} payloadSig
 */

/**
 * @class ProUpRegTxPayload
 * @property {number} version uint_16	2	Upgrade Provider Transaction version number. Currently set to 1.
 * @property {string} proTXHash uint256	32	The hash of the provider transaction
 * @property {number} mode uint_16	2	Masternode mode
 * @property {string} keyIdOperator CKeyID	20	The public key hash used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIdVoting CKeyID	20	The public key hash used for voting.
 * @property {number} scriptPayoutSize compactSize uint	1-9	Size of the Payee Script.
 * @property {string} scriptPayout Script	Variable	Payee script (p2pkh/p2sh)
 * @property {number} payloadSigSize compactSize uint	1-9	Size of the Signature
 * @property {string} payloadSig vector	Variable	Signature of the hash of the ProTx fields. Signed by the Owner.
 */
function ProUpRegTxPayload(options) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (options) {
    this.proTXHash = options.proTXHash;
    this.mode = options.mode;
    this.keyIdOperator = options.keyIdOperator;
    this.keyIdVoting = options.keyIdVoting;
    this.scriptPayoutSize = options.scriptPayoutSize;
    this.scriptPayout = options.scriptPayout;
    this.payloadSigSize = options.payloadSigSize;
    this.payloadSig = options.payloadSig;
  }
}

ProUpRegTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpRegTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Serializes ProUpRegTxPayload payload
 * @param {ProUpRegTransactionPayloadJSON} transitionPayload
 * @return {Buffer} serialized payload
 */
ProUpRegTxPayload.serializeJSONToBuffer = function (transitionPayload) {
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(transitionPayload.version)
    .write(Buffer.from(transitionPayload.proTXHash, 'hex').reverse())
    .writeUInt16LE(transitionPayload.mode)
    .write(Buffer.from(transitionPayload.keyIdOperator, 'hex').reverse())
    .write(Buffer.from(transitionPayload.keyIdVoting, 'hex').reverse())
    .writeVarintNum(transitionPayload.scriptPayoutSize)
    .write(Buffer.from(transitionPayload.scriptPayout, 'hex').reverse()); // TODO: Determine whether this reverse is needed


  if (transitionPayload.payloadSig) {
    var signatureBuf = Buffer.from(transitionPayload.payloadSig, 'hex');
    payloadBufferWriter.writeVarintNum(signatureBuf.length);
    payloadBufferWriter.write(signatureBuf);
  } else {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Parses raw ProUpRegTxPayload payload
 * @param {Buffer} rawPayload
 * @return {ProUpRegTxPayload}
 */
ProUpRegTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpRegTxPayload();
  var signatureSize = 0;
  payload.version = payloadBufferReader.readUInt16LE();
  payload.proTXHash = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');
  payload.mode = payloadBufferReader.readUInt16LE();
  payload.keyIdOperator = payloadBufferReader.read(CKEYID_SIZE).reverse().toString('hex');
  payload.keyIdVoting = payloadBufferReader.read(CKEYID_SIZE).reverse().toString('hex');
  var scriptPayoutSize = payloadBufferReader.readVarintNum();
  payload.scriptPayout = payloadBufferReader.read(scriptPayoutSize).reverse().toString('hex');

  if (!payloadBufferReader.finished()) {
    signatureSize = payloadBufferReader.readVarintNum();
  }

  if (signatureSize > 0) {
    payload.payloadSig = payloadBufferReader.read(signatureSize).toString('hex');
  }

  ProUpRegTxPayload.validatePayloadJSON(payload.toJSON());
  return payload;
};

/**
 * Creates new instance of ProUpRegTxPayload payload from JSON
 * @param {string|ProUpRegTransactionPayloadJSON} payloadJson
 * @return {ProUpRegTxPayload}
 */
ProUpRegTxPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new ProUpRegTxPayload();

  payload.version = payloadJson.version;
  payload.proTXHash = payloadJson.proTXHash;
  payload.mode = payloadJson.mode;
  payload.keyIdOperator = payloadJson.keyIdOperator;
  payload.keyIdVoting = payloadJson.keyIdVoting;
  payload.scriptPayoutSize = payloadJson.scriptPayoutSize;
  payload.scriptPayout = payloadJson.scriptPayout;

  if (payloadJson.payloadSig) {
    payload.payloadSig = payloadJson.payloadSig;
  }

  ProUpRegTxPayload.validatePayloadJSON(payload.toJSON());
  return payload;
};

/**
 * Validates ProUpRegTxPayload payload
 * @param {ProUpRegTransactionPayloadJSON} payload
 * @return {boolean}
 */
ProUpRegTxPayload.validatePayloadJSON = function (payload) {
  if (!payload) {
    throw new Error('No Payload specified');
  }

  /**
   * @class ProUpRegTxPayload
   * @property {number} version uint_16	2	Upgrade Provider Transaction version number. Currently set to 1.
   * @property {string} proTXHash uint256	32	The hash of the provider transaction
   * @property {number} mode uint_16	2	Masternode mode
   * @property {string} keyIdOperator CKeyID	20	The public key hash used for operational related signing (network messages, ProTx updates)
   * @property {string} keyIdVoting CKeyID	20	The public key hash used for voting.
   * @property {number} scriptPayoutSize compactSize uint	1-9	Size of the Payee Script.
   * @property {string} scriptPayout Script	Variable	Payee script (p2pkh/p2sh)
   * @property {number} payloadSigSize compactSize uint	1-9	Size of the Signature
   * @property {string} payloadSig vector	Variable	Signature of the hash of the ProTx fields. Signed by the Owner.
   */

  Preconditions.checkArgumentType(payload.version, 'number', 'version');
  Preconditions.checkArgumentType(payload.proTXHash, 'string', 'proTXHash');
  Preconditions.checkArgumentType(payload.mode, 'number', 'mode');
  Preconditions.checkArgumentType(payload.keyIdOperator, 'string', 'keyIdOperator');
  Preconditions.checkArgumentType(payload.keyIdVoting, 'string', 'keyIdVoting');
  Preconditions.checkArgumentType(payload.scriptPayoutSize, 'number', 'scriptPayoutSize');
  Preconditions.checkArgumentType(payload.scriptPayout, 'string', 'scriptPayout');
  Preconditions.checkArgumentType(payload.payloadSigSize, 'number', 'payloadSigSize');
  Preconditions.checkArgumentType(payload.payloadSig, 'string', 'payloadSig');

  Preconditions.checkArgument(isUnsignedInteger(payload.version), 'Expected version to be an unsigned integer');
  Preconditions.checkArgument(isUnsignedInteger(payload.mode), 'Expected mode to be an unsigned integer');

  Preconditions.checkArgument(isHexString(payload.proTXHash), 'expected proTXHash to be a hex string but got ' + typeof payload.proTXHash);
  Preconditions.checkArgument(payload.proTXHash.length === constants.SHA256_HASH_SIZE * 2, 'Invalid proTXHash size');

  if (payload.payloadSig) {
    Preconditions.checkArgument(isHexString(payload.payloadSig), 'expected payloadSig to be a hex string but got ' + typeof payload.payloadSig);
    Preconditions.checkArgument(payload.payloadSig.length === constants.COMPACT_SIGNATURE_SIZE * 2, 'Invalid payloadSig size');
  }
};

/* Instance methods */

/**
 * Validates ProUpRegTxPayload payload data
 * @return {boolean}
 */
ProUpRegTxPayload.prototype.validate = function() {
  return ProUpRegTxPayload.validatePayloadJSON(this.toJSON());
};

/**
 * Serializes ProUpRegTxPayload payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {ProUpRegTransactionPayloadJSON}
 */
ProUpRegTxPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature = Boolean(options && options.skipSignature) || !Boolean(this.payloadSig);
  var payloadJSON = {
    version: this.version,
    proTXHash: this.proTXHash,
    mode: this.mode,
    keyIdOperator: this.keyIdOperator,
    keyIdVoting: this.keyIdVoting,
    scriptPayoutSize: this.scriptPayoutSize,
    scriptPayout: this.scriptPayout,
    payloadSigSize: this.payloadSigSize,
  };
  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  ProUpRegTxPayload.validatePayloadJSON(payloadJSON);
  return payloadJSON;
};

/**
 * Serializes ProUpRegTxPayload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
ProUpRegTxPayload.prototype.toBuffer = function toBuffer(options) {
  return ProUpRegTxPayload.serializeJSONToBuffer(this.toJSON(options));
};

/**
 * Copy payload instance
 * @return {ProUpRegTxPayload}
 */
ProUpRegTxPayload.prototype.copy = function copy() {
  return ProUpRegTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpRegTxPayload;
