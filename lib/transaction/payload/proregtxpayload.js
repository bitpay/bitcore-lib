var utils = require('../../util/js');
var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var Script = require('../../script');

var CURRENT_PAYLOAD_VERSION = 1;

/**
 * @typedef {Object} ProRegTxPayloadJSON
 * @property {number} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {number} type
 * @property {number} mode
 * @property {string} collateralHash
 * @property {number} collateralIndex	uint_32	4	The collateral index.
 * @property {string} ipAddress	byte[]	16	IPv6 address in network byte order. Only IPv4 mapped addresses are allowed (to be extended in the future)
 * @property {number} port uint_16	2	Port (network byte order)
 * @property {string} keyIdOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} keyIdOperator	BLSPubKey	48	The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIdVoting	CKeyID	20	The public key hash used for voting.
 * @property {number} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {string} scriptPayout	Script	Variable	Payee script (p2pkh/p2sh)
 * @property {string} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with KeyIdOwner
 */

/**
 * @class ProRegTxPayload
 * @property {number} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {number} type
 * @property {number} mode
 * @property {string} collateralHash
 * @property {number} collateralIndex	uint_32	4	The collateral index.
 * @property {string} ipAddress	byte[]	16	IPv6 address in network byte order. Only IPv4 mapped addresses are allowed (to be extended in the future)
 * @property {number} port uint_16	2	Port (network byte order)
 * @property {string} keyIdOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} keyIdOperator	BLSPubKey	48	The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIdVoting	CKeyID	20	The public key hash used for voting.
 * @property {number} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {string} scriptPayout	Script	Variable	Payee script (p2pkh/p2sh)
 * @property {string} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with KeyIdOwner
 */
function ProRegTxPayload(options) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (options) {
    this.type = options.type;
    this.mode = options.mode;
    this.collateralHash = options.collateralHash;
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
    this.payloadSigSize = this.payloadSig.length * 2
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
  payload.type = payloadBufferReader.readUInt16LE();
  payload.mode = payloadBufferReader.readUInt16LE();
  payload.collateralHash = payloadBufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');
  payload.collateralIndex = payloadBufferReader.readUInt32LE();
  payload.ipAddress = payloadBufferReader.read(16).toString('hex');
  payload.port = payloadBufferReader.readUInt16BE();
  payload.keyIdOwner = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).reverse().toString('hex');
  payload.keyIdOperator = payloadBufferReader.read(constants.BLS_PUBLIC_KEY_SIZE).toString('hex');
  payload.keyIdVoting = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).reverse().toString('hex');
  payload.operatorReward = payloadBufferReader.readUInt16LE();
  var scriptPayoutSize = payloadBufferReader.readVarintNum();
  payload.scriptPayout = payloadBufferReader.read(scriptPayoutSize).toString('hex');
  payload.inputsHash = payloadBufferReader.read(constants.SHA256_HASH_SIZE).toString('hex');
  payload.payloadSigSize = payloadBufferReader.readVarintNum();
  if (payload.payloadSigSize > 0) {
    payload.payloadSig = payloadBufferReader.read(payload.payloadSigSize).toString('hex');
  }

  if (!payloadBufferReader.finished()) {
    throw new Error('Failed to parse payload: raw payload is bigger than expected.');
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
  Preconditions.checkArgumentType(this.collateralIndex, 'number', 'collateralIndex');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.collateralIndex), 'Expect collateralIndex to be an unsigned integer');
  Preconditions.checkArgument(utils.isSha256HexString(this.collateralHash), 'Expect collateralHash to be a hex string representing sha256 hash');
  Preconditions.checkArgument(this.ipAddress, 'string', 'Expect ipAddress to be a string');
  Preconditions.checkArgument(this.ipAddress.length === constants.IP_ADDRESS_SIZE * 2, 'Expect ipAddress to be a hex string representing an ipv6 address');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.port), 'Expect port to be an unsigned integer');
  Preconditions.checkArgument(utils.isHexaString(this.keyIdOwner), 'Expect keyIdOwner to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.keyIdOperator), 'Expect keyIdOperator to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.keyIdVoting), 'Expect keyIdVoting to be a hex string');
  Preconditions.checkArgument(this.keyIdOwner.length === constants.PUBKEY_ID_SIZE * 2, 'Expect keyIdOwner to be 20 bytes in size ');
  Preconditions.checkArgument(this.keyIdOperator.length === constants.BLS_PUBLIC_KEY_SIZE * 2, 'Expect keyIdOwner to be 48 bytes in size ');
  Preconditions.checkArgument(this.keyIdVoting.length === constants.PUBKEY_ID_SIZE * 2, 'Expect keyIdOwner to be 20 bytes in size ');
  Preconditions.checkArgumentType(this.operatorReward, 'number', 'operatorReward');
  Preconditions.checkArgument(this.operatorReward < 10000, 'Expect operatorReward to be lesser than 10000');
  Preconditions.checkArgument(utils.isHexaString(this.inputsHash), 'Expect inputsHash to be a hex string');

  if (this.scriptPayout) {
    var script = new Script(this.scriptPayout);
    Preconditions.checkArgument(script.isPublicKeyHashOut() || script.isScriptHashOut(), 'Expected scriptOperatorPayout to be a p2pkh/p2sh');
  }

  if (Boolean(this.payloadSig)) {
    Preconditions.checkArgumentType(this.payloadSigSize, 'number', 'payloadSigSize');
    Preconditions.checkArgument(utils.isUnsignedInteger(this.payloadSigSize), 'Expect payloadSigSize to be an unsigned integer');
    Preconditions.checkArgument(utils.isHexaString(this.payloadSig), 'Expect payload sig to be a hex string');
  }
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
    type : this.type,
    mode : this.mode,
    collateralHash: this.collateralHash,
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
    payloadJSON.payloadSigSize = this.payloadSigSize;
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
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);
  this.validate();

  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .writeUInt16LE(this.type)
    .writeUInt16LE(this.mode)
    .write(Buffer.from(this.collateralHash, 'hex').reverse())
    .writeInt32LE(this.collateralIndex)
    .write(Buffer.from(this.ipAddress, 'hex'))
    .writeUInt16BE(this.port)
    .write(Buffer.from(this.keyIdOwner, 'hex').reverse())
    .write(Buffer.from(this.keyIdOperator, 'hex'))
    .write(Buffer.from(this.keyIdVoting, 'hex').reverse())
    .writeUInt16LE(this.operatorReward)
    .writeVarintNum(Buffer.from(this.scriptPayout, 'hex').length)
    .write(Buffer.from(this.scriptPayout, 'hex'))
    .write(Buffer.from(this.inputsHash, 'hex'));

  if (!skipSignature) {
    payloadBufferWriter.writeVarintNum(Buffer.from(this.payloadSig, 'hex').length);
    payloadBufferWriter.write(Buffer.from(this.payloadSig, 'hex'));
  } else {
    payloadBufferWriter.write(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

ProRegTxPayload.prototype.copy = function copy() {
  return ProRegTxPayload.fromBuffer(this.toBuffer());
};

module.exports = ProRegTxPayload;
