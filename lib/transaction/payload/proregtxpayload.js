var utils = require('../../util/js');
var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');

var CURRENT_PAYLOAD_VERSION = 1;

/**
 * @typedef {Object} ProRegTxPayloadJSON
 * @property {number} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {number} protocolVersion
 * @property {number} collateralIndex	uint_32	4	The collateral index.
 * @property {string} ipAddress	byte[]	16	IPv6 address in network byte order. Only IPv4 mapped addresses are allowed (to be extended in the future)
 * @property {number} port uint_16	2	Port (network byte order)
 * @property {string} keyIdOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} keyIdOperator	CKeyID	20	The public key hash used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIdVoting	CKeyID	20	The public key hash used for voting.
 * @property {number} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {string} scriptPayout	Script	Variable	Payee script (p2pkh/p2sh)
 * @property {string} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with KeyIdOwner
 */

/**
 * @class ProRegTxPayload
 * @property {number} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {number} protocolVersion
 * @property {number} collateralIndex	uint_32	4	The collateral index.
 * @property {string} ipAddress	byte[]	16	IPv6 address in network byte order. Only IPv4 mapped addresses are allowed (to be extended in the future)
 * @property {number} port uint_16	2	Port (network byte order)
 * @property {string} keyIdOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} keyIdOperator	CKeyID	20	The public key hash used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIdVoting	CKeyID	20	The public key hash used for voting.
 * @property {number} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {string} scriptPayout	Script	Variable	Payee script (p2pkh/p2sh)
 * @property {string} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with KeyIdOwner
 */
function ProRegTxPayload(options) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (options) {
    this.collateralIndex = options.collateralIndex;
    this.ipAddress = options.ipAddress;
    this.port = options.port;
    this.keyIdOwner = options.keyIdOwner;
    this.keyIdOperator = options.keyIdOperator;
    this.keyIdVoting = options.keyIdVoting;
    this.operatorReward = options.operatorReward;
    this.scriptPayout = options.scriptPayout;
    this.inputsHash = options.inputsHash;
    this.payloadSig = options.payloadSig;
    this.protocolVersion = options.protocolVersion;
  }
}

ProRegTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProRegTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw payload
 * @param {Buffer} rawPayload
 * @return {ProRegTxPayload}
 */
ProRegTxPayload.fromBuffer = function fromBuffer(rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProRegTxPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  payload.protocolVersion = payloadBufferReader.readInt32LE();
  payload.collateralIndex = payloadBufferReader.readUInt32LE();
  payload.ipAddress = payloadBufferReader.read(16).toString('hex');
  payload.port = payloadBufferReader.readUInt16BE();

  // TODO: not sure about a byte order
  payload.keyIdOwner = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.keyIdOperator = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.keyIdVoting = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).toString('hex');

  var scriptPayoutSize = payloadBufferReader.readVarintNum();
  payload.scriptPayout = payloadBufferReader.read(scriptPayoutSize).toString('hex');

  payload.operatorReward = payloadBufferReader.readUInt16LE();
  payload.inputsHash = payloadBufferReader.read(constants.SHA256_HASH_SIZE).toString('hex');

  var payloadSigSize = payloadBufferReader.readVarintNum();

  if (payloadSigSize > 0) {
    payload.payloadSig = payloadBufferReader.read(payloadSigSize).toString('hex');
  }

  if (!payloadBufferReader.finished()) {
    throw new Error('Unexpected payload size');
  }

  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|ProRegTxPayloadJSON} payloadJson
 * @return {ProRegTxPayload}
 */
ProRegTxPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new ProRegTxPayload(payloadJson);
  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validate payload
 * @return {boolean}
 */
ProRegTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(utils.isUnsignedInteger(this.version), 'Expect version to be an unsigned integer');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.type), 'Expect type to be an unsigned integer');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.mode), 'Expect mode to be an unsigned integer');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.collateralIndex), 'Expect collateralIndex to be an unsigned integer');
  Preconditions.checkArgument(this.ipAddress, 'string', 'Expect ipAddress to be a string');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.port), 'Expect port to be an unsigned integer');
  Preconditions.checkArgument(utils.isHexaString(this.keyIdOwner), 'Expect KeyIdOwner to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.keyIdOperator), 'Expect KeyIdOperator to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.keyIdVoting), 'Expect KeyIdVoting to be a hex string');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.operatorReward), 'Expect operatorReward to be an unsigned integer');
  Preconditions.checkArgument(utils.isHexaString(this.scriptPayout), 'Expect scriptPayout to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.inputsHash), 'Expect inputsHash to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.payloadSig), 'Expect payloadSig to be a hex string');
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param [options.skipSignature]
 * @return {ProRegTxPayloadJSON}
 */
ProRegTxPayload.prototype.toJSON = function toJSON(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);
  this.validate();
  var payloadJSON = {
    version : this.version,
    protocolVersion: this.protocolVersion,
    collateralIndex: this.collateralIndex,
    ipAddress: this.ipAddress,
    port: this.port,
    keyIdOwner: this.keyIdOwner,
    keyIdOperator: this.keyIdOperator,
    keyIdVoting : this.keyIdVoting,
    operatorReward: this.operatorReward,
    scriptPayout: this.scriptPayout,
    inputsHash: this.inputsHash
  };
  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {Boolean} [options.skipSignature] - skip signature. Needed for signing
 * @return {Buffer}
 */
ProRegTxPayload.prototype.toBuffer = function toBuffer(options) {
  var skipSignature = !Boolean(this.payloadSig) || (options && options.skipSignature);
  this.validate();

  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .writeUInt32LE(this.protocolVersion)
    .writeInt32LE(this.collateralIndex)
    .write(Buffer.from(this.ipAddress, 'hex'))
    .writeUInt16BE(this.port)
    .write(Buffer.from(this.KeyIdOwner, 'hex'))
    .write(Buffer.from(this.KeyIdOperator, 'hex'))
    .write(Buffer.from(this.KeyIdVoting, 'hex'))
    .writeVarintNum(Buffer.from(this.scriptPayout, 'hex').length)
    .write(Buffer.from(this.scriptPayout, 'hex'))
    .writeUInt16LE(this.operatorReward)
    .write(Buffer.from(this.inputsHash, 'hex'));

  if (!skipSignature) {
    payloadBufferWriter.writeVarintNum(Buffer.from(this.payloadSig, 'hex').length);
    payloadBufferWriter.write(Buffer.from(this.payloadSig, 'hex'));
  } else {
    payloadBufferWriter.write(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

module.exports = ProRegTxPayload;