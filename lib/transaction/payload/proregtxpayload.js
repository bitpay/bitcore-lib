var utils = require('../../util/js');
var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferUtil = require('../../util/buffer');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');

var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;

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

function ProRegTxPayload() {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
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
  SubTxRegisterPayload.validatePayloadJSON(payload);
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
    .write(ipAddressBuffer)
    .writeUInt16BE(payload.port)
    .write(Buffer.from(payload.KeyIdOwner, 'hex'))
    .write(Buffer.from(payload.KeyIdOperator, 'hex'))
    .write(Buffer.from(payload.KeyIdVoting, 'hex'))
    .writeUInt16LE(payload.operatorReward)
    .writeVarintNum(payload.scriptPayoutSize.length)
    .write(payload.scriptPayoutSize)
    .writeVarintNum(payload.scriptPayout.length)
    .write(payload.scriptPayout)
    .write(Buffer.from(payload.inputsHash, 'hex'))
    .writeVarintNum(payload.payloadSigSize.length)
    .write(payload.payloadSigSize)
    .writeVarintNum(payload.payloadSig.length)
    .write(payload.payloadSig)

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
  payload.ipAddress = br.readUInt8() + '.' + br.readUInt8() + '.' + br.readUInt8() + '.' + br.readUInt8();
  payload.port = br.readUInt16BE();
  payload.KeyIdOwner = br.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.KeyIdOperator = br.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.KeyIdVoting = br.read(constants.PUBKEY_ID_SIZE).toString('hex');
  payload.operatorReward = br.readUInt16LE();

  var scriptPayoutSizeLength = br.readVarintNum();
  payload.scriptPayout = br.read(scriptPayoutSizeLength);

  payload.inputsHash = br.read(constants.SHA256_HASH_SIZE).toString('hex');

  var payloadSigSizeLength = br.readVarintNum();
  payload.payloadSigSize = br.read(payloadSigSizeLength);

  var payloadSigLength = br.readVarintNum();
  payload.payloadSig = br.read(payloadSigLength);

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
  payload.operatorReward = payloadJson.scriptPayoutSize;
  payload.operatorReward = payloadJson.scriptPayout;
  payload.operatorReward = payloadJson.payloadSigSize;
  payload.operatorReward = payloadJson.payloadSigSize;

  return payload;
};

/**
 * Validate payload
 * @param {JSON} payload
 * @return {boolean}
 */
ProRegTxPayload.validatePayloadJSON = function (payload) {
  if (!blockchainUserPayload) {
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
    //todo
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