var constants = require('../constants');
var Preconditions = require('../../../util/preconditions');
var BufferUtil = require('../../../util/buffer');
var BufferWriter = require('../../../encoding/bufferwriter');
var BufferReader = require('../../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');

var CURRENT_PAYLOAD_VERSION = 1;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;
var HASH_SIZE = constants.HASH_SIZE;
var SIGNATURE_SIZE = constants.COMPACT_SIGNATURE_SIZE;

/**
 * @typedef {Object} TransitionPayloadJSON
 * @property {Number} nVersion
 * @property {Buffer} regTxId
 * @property {Buffer} hashPrevSubTx
 * @property {Number} creditFee
 * @property {Buffer} hashSTPacket
 * @property {Buffer} [vchSig]
 */

/**
 * @class SubTxTransitionPayload
 * @property {Number} nVersion
 * @property {Buffer} regTxId
 * @property {Buffer} hashPrevSubTx
 * @property {Number} creditFee
 * @property {Buffer} hashSTPacket
 * @property {Buffer} [vchSig]
 */
function SubTxTransitionPayload() {
  this.nVersion = CURRENT_PAYLOAD_VERSION;
}

SubTxTransitionPayload.prototype = Object.create(AbstractPayload.prototype);
SubTxTransitionPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Serialize transition payload
 * @param {TransitionPayloadJSON} transitionPayload
 * @return {Buffer} serialized payload
 */
SubTxTransitionPayload.serializeJSONToBuffer = function (transitionPayload) {
  SubTxTransitionPayload.validatePayloadJSON(transitionPayload);
  var payloadBufferWriter = new BufferWriter();

  // TODO: credit fee size
  payloadBufferWriter
    .writeUInt16LE(transitionPayload.nVersion)
    .write(transitionPayload.regTxId)
    .write(transitionPayload.hashPrevSubTx)
    .write(this.creditFee)
    .write(this.hashSTPacket);

  if (transitionPayload.vchSig) {
    payloadBufferWriter.write(transitionPayload.vchSig);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {SubTxTransitionPayload}
 */
SubTxTransitionPayload.parsePayloadBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new SubTxTransitionPayload();

  payload.nVersion = payloadBufferReader.readUInt16LE();
  payload.regTxId = payloadBufferReader.read(HASH_SIZE);
  payload.hashPrevSubTx = payloadBufferReader.read(HASH_SIZE);
  // TODO: check actual credit fee size. Probably it's 64 bit
  payload.creditFee = payloadBufferReader.readInt32LE();
  payload.hashSTPacket = payloadBufferReader.read(HASH_SIZE);

  if (!payloadBufferReader.finished()) {
    payload.vchSig = payloadBufferReader.read(constants.COMPACT_SIGNATURE_SIZE);
  }

  SubTxTransitionPayload.validatePayloadJSON(payload.toJSON());
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|TransitionPayloadJSON} payloadJson
 * @return {SubTxTransitionPayload}
 */
SubTxTransitionPayload.parsePayloadJSON = function parsePayloadJSON(payloadJson) {
  SubTxTransitionPayload.validatePayloadJSON(payloadJson);
  var payload = new SubTxTransitionPayload();
  payload.nVersion = payloadJson.nVersion;
  payload.setUserName(payloadJson.userName);
  payload.setPubKeyId(payloadJson.pubKeyId);
  payload.vchSig = BufferUtil.copy(payloadJson.vchSig);
  return payload;
};

/**
 * Validate payload
 * @param {BlockchainUserPayloadJSON} blockchainUserPayload
 * @return {boolean}
 */
SubTxTransitionPayload.validatePayloadJSON = function (blockchainUserPayload) {
  if (!blockchainUserPayload) {
    throw new Error('No Payload specified');
  }

  Preconditions.checkArgumentType(blockchainUserPayload.nVersion, 'number', 'nVersion');
  Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.pubKeyId), 'expect pubKeyId to be a Buffer but got ' + typeof blockchainUserPayload.pubKeyId);
  Preconditions.checkArgument(blockchainUserPayload.pubKeyId.length === constants.PUBKEY_ID_SIZE, 'Invalid pubKeyId size');
  Preconditions.checkArgumentType(blockchainUserPayload.userName, 'string', 'userName');
  Preconditions.checkArgument(blockchainUserPayload.userName.length > 1, 'userName is too short');
  if (blockchainUserPayload.vchSig) {
    Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.vchSig), 'expect vchSig to be a Buffer but got ' + typeof blockchainUserPayload.vchSig);
    Preconditions.checkArgument(blockchainUserPayload.vchSig.length === constants.COMPACT_SIGNATURE_SIZE, 'Invalid vchSig size');
  }
};

/* Instance methods */

/**
 * @param {Buffer|String} regTxId - Buffer or hex string
 */
SubTxTransitionPayload.prototype.setRegTxId = function(regTxId) {
  if (typeof regTxId === 'string') {
    regTxId = Buffer.from(regTxId, 'hex');
  }
  this.regTxId = BufferUtil.copy(regTxId);
};

/**
 * @param {Buffer|String} hashPrevSubTx - Buffer or hex string
 */
SubTxTransitionPayload.prototype.setHashPrevSubTx = function(hashPrevSubTx) {
  if (typeof hashPrevSubTx === 'string') {
    hashPrevSubTx = Buffer.from(hashPrevSubTx, 'hex');
  }
  this.hashPrevSubTx = BufferUtil.copy(hashPrevSubTx);
};

/**
 * @param {Buffer|String} hashSTPacket - Buffer or hex string
 */
SubTxTransitionPayload.prototype.setHashPrevSubTx = function(hashSTPacket) {
  if (typeof hashSTPacket === 'string') {
    hashSTPacket = Buffer.from(hashSTPacket, 'hex');
  }
  this.hashSTPacket = BufferUtil.copy(hashSTPacket);
};

/**
 * @param {number} creditFee
 */
SubTxTransitionPayload.prototype.setCreditFee = function(creditFee) {
  this.creditFee = creditFee;
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {TransitionPayloadJSON}
 */
SubTxTransitionPayload.prototype.toJSON = function toJSON(options) {
  var payloadJSON = {
    nVersion: this.nVersion,
    regTxId: this.regTxId,
    hashPrevSubTx: this.hashPrevSubTx,
    creditFee: this.creditFee,
    hashSTPacket: this.hashSTPacket
  };
  if (!options || (options && !options.skipSignature)) {
    payloadJSON.vchSig = this.vchSig;
  }
  SubTxTransitionPayload.validatePayloadJSON(payloadJSON);
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
SubTxTransitionPayload.prototype.toBuffer = function toBuffer(options) {
  return SubTxTransitionPayload.serializeJSONToBuffer(this.toJSON(options));
};

module.exports = SubTxTransitionPayload;