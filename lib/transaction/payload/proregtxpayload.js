var utils = require('../../util/js');
var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferUtil = require('../../util/buffer');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');

var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;

//todo: types
/**
 * @class ProRegTx
 * @property {} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {} type	uint_16	2	Masternode type. Default set to 0.
 * @property {} mode	uint_16	2	Masternode mode. Default set to 0.
 * @property {} collateralIndex	uint_32	4	The collateral index.
 * @property {} ipAddress	byte[]	16	IPv6 address in network byte order. Only IPv4 mapped addresses are allowed (to be extended in the future)
 * @property {} port uint_16	2	Port (network byte order)
 * @property {} KeyIdOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {} KeyIdOperator	CKeyID	20	The public key hash used for operational related signing (network messages, ProTx updates)
 * @property {} KeyIdVoting	CKeyID	20	The public key hash used for voting.
 * @property {} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {} scriptPayoutSize	compactSize uint	1-9	Size of the Payee Script.
 * @property {} scriptPayout	Script	Variable	Payee script (p2pkh/p2sh)
 * @property {} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {} payloadSigSize	compactSize uint	1-9	Size of the Signature
 * @property {} payloadSig	vector	Variable	Signature of the hash of the ProTx fields. Signed with KeyIdOwner
 */

function ProRegTxPayload(options) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if(options){
    this.type = options.type
    this.mode = options.mode
    this.collateralIndex = options.collateralIndex
    this.ipAddress = options.ipAddress
    this.port = options.port
    this.KeyIdOwner = options.KeyIdOwner
    this.KeyIdOperator = options.KeyIdOperator
    this.KeyIdVoting = options.KeyIdVoting
    this.operatorReward = options.operatorReward
    this.scriptPayoutSize = options.scriptPayoutSize
    this.scriptPayout = options.scriptPayout
    this.inputsHash = options.inputsHash
    this.payloadSigSize = options.payloadSigSize
    this.payloadSig = options.payloadSig
  }
}

ProRegTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProRegTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Serialize blockchain user payload
 * @param {JSON} payload
 * @return {Buffer} serialized payload
 */
ProRegTxPayload.serializeJSONToBuffer = function (payload) {
  ProRegTxPayload.validatePayloadJSON(payload);
  var payloadBufferWriter = new BufferWriter();

  //ipAddress
  var parts = payload.ipAddress.split('.');
  var ipAddressBuffer = new BufferWriter();
  for (let i = 0; i < parts.length; i++) {
    ipAddressBuffer.writeUInt8(parts[i]);
  }

  payloadBufferWriter
    .writeUInt16LE(payload.version)
    .writeUInt16LE(payload.type)
    .writeUInt16LE(payload.mode)
    .writeInt32LE(payload.collateralIndex)
    .write(ipAddressBuffer.toBuffer())
    .writeUInt16BE(payload.port)
    .write(Buffer.from(payload.KeyIdOwner, 'hex'))
    .write(Buffer.from(payload.KeyIdOperator, 'hex'))
    .write(Buffer.from(payload.KeyIdVoting, 'hex'))
    .writeUInt16LE(payload.operatorReward)
    .writeVarintNum(payload.scriptPayoutSize.length)
    .write(Buffer.from(payload.scriptPayoutSize.toString()))
    .writeVarintNum(payload.scriptPayout.length)
    .write(Buffer.from(payload.scriptPayout.toString()))
    .write(Buffer.from(payload.inputsHash, 'hex'))
    .writeVarintNum(payload.payloadSigSize.length)
    .write(Buffer.from(payload.payloadSigSize.toString()))
    .writeVarintNum(payload.payloadSig.length)
    .write(Buffer.from(payload.payloadSig))

  return payloadBufferWriter.toBuffer();
};

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
  payload.collateralIndex = payloadBufferReader.readUInt32LE();
  payload.ipAddress = payloadBufferReader.readUInt8() + '.' 
                      + payloadBufferReader.readUInt8() + '.' 
                      + payloadBufferReader.readUInt8() 
                      + '.' + payloadBufferReader.readUInt8();

  payload.port = payloadBufferReader.readUInt16BE();
  payload.KeyIdOwner = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.KeyIdOperator = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.KeyIdVoting = payloadBufferReader.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.operatorReward = payloadBufferReader.readUInt16LE();

  var scriptPayoutSizeLength = payloadBufferReader.readVarintNum();
  payload.scriptPayout = payloadBufferReader.read(scriptPayoutSizeLength);

  payload.inputsHash = payloadBufferReader.read(constants.SHA256_HASH_SIZE).toString('hex');

  var payloadSigSizeLength = payloadBufferReader.readVarintNum();
  payload.payloadSigSize = payloadBufferReader.read(payloadSigSizeLength);

  var payloadSigLength = payloadBufferReader.readVarintNum();
  payload.payloadSig = payloadBufferReader.read(payloadSigLength);

  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|BlockchainUserPayloadJSON} payloadJson
 * @return {SubTxRegisterPayload}
 */
ProRegTxPayload.fromJSON = function fromJSON(payloadJson) {
  ProRegTxPayload.validatePayloadJSON(payloadJson);

  var payload = new ProRegTxPayload();

  //todo this.
  payload.version = payloadJson.version;
  payload.type = payloadJson.type;
  payload.mode = payloadJson.mode;
  payload.collateralIndex = payloadJson.collateralIndex;
  payload.ipAddress = payloadJson.ipAddress;
  payload.port = payloadJson.port;
  payload.KeyIdOwner = payloadJson.KeyIdOwner;
  payload.KeyIdOperator = payloadJson.KeyIdOperator;
  payload.KeyIdVoting = payloadJson.KeyIdVoting;
  payload.operatorReward = payloadJson.operatorReward;
  payload.scriptPayoutSize = payloadJson.scriptPayoutSize;
  payload.scriptPayout = payloadJson.scriptPayout;
  payload.payloadSigSize = payloadJson.payloadSigSize;
  payload.payloadSig = payloadJson.payloadSig;

  return payload;
};

/**
 * Validate payload
 * @param {JSON} payload
 * @return {boolean}
 */
ProRegTxPayload.validatePayloadJSON = function (payload) {
  if (!payload) {
    throw new Error('No Payload specified');
  }

  Preconditions.checkArgumentType(payload.version, 'number', 'version');
  Preconditions.checkArgumentType(payload.type, 'number', 'version');
  Preconditions.checkArgumentType(payload.mode, 'number', 'version');

};

/* Instance methods */

/**
 * Serializes payload to JSON
 * @param [options]
 * @return {payloadJSON}
 */
ProRegTxPayload.prototype.toJSON = function toJSON() {

  var payloadJSON = {
    version: this.version,
    type: this.type,
    mode: this.mode,
    collateralIndex: this.collateralIndex,
    ipAddress: this.ipAddress,
    port: this.port,
    KeyIdOwner: this.KeyIdOwner,
    KeyIdOperator: this.KeyIdOperator,
    KeyIdVoting: this.KeyIdVoting,
    operatorReward: this.operatorReward,
    scriptPayoutSize: this.scriptPayoutSize,
    scriptPayout: this.scriptPayout,
    inputsHash: this.inputsHash,
    payloadSigSize: this.payloadSigSize,
    payloadSig: this.payloadSig

  };

  ProRegTxPayload.validatePayloadJSON(payloadJSON);
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @return {Buffer}
 */
ProRegTxPayload.prototype.toBuffer = function toBuffer() {
  return ProRegTxPayload.serializeJSONToBuffer(this.toJSON());
};

module.exports = ProRegTxPayload;