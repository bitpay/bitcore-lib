var constants = require('../constants');
var Preconditions = require('../../../util/preconditions');
var BufferUtil = require('../../../util/buffer');
var BufferWriter = require('../../../encoding/bufferwriter');
var BufferReader = require('../../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var isUnsignedInteger = require('../../../util/js').isUnsignedInteger;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
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
    .writeUInt32LE(transitionPayload.creditFee)
    .write(transitionPayload.hashSTPacket);

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
SubTxTransitionPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new SubTxTransitionPayload();

  payload.nVersion = payloadBufferReader.readUInt16LE();
  payload.regTxId = payloadBufferReader.read(HASH_SIZE);
  payload.hashPrevSubTx = payloadBufferReader.read(HASH_SIZE);
  // TODO: check actual credit fee size. Probably it's 64 bit
  payload.creditFee = payloadBufferReader.readUInt32LE();
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
SubTxTransitionPayload.fromJSON = function fromJSON(payloadJson) {
  SubTxTransitionPayload.validatePayloadJSON(payloadJson);
  var payload = new SubTxTransitionPayload();
  payload.nVersion = payloadJson.nVersion;
  payload
    .setHashSTPacket(payloadJson.hashSTPacket)
    .setCreditFee(payloadJson.creditFee)
    .setRegTxId(payloadJson.regTxId)
    .setHashPrevSubTx(payloadJson.hashPrevSubTx);
  payload.vchSig = BufferUtil.copy(payloadJson.vchSig);
  return payload;
};

/**
 * Validate payload
 * @param {TransitionPayloadJSON} blockchainUserPayload
 * @return {boolean}
 */
SubTxTransitionPayload.validatePayloadJSON = function (blockchainUserPayload) {
  if (!blockchainUserPayload) {
    throw new Error('No Payload specified');
  }

  Preconditions.checkArgumentType(blockchainUserPayload.nVersion, 'number', 'nVersion');
  Preconditions.checkArgumentType(blockchainUserPayload.creditFee, 'number', 'creditFee');

  Preconditions.checkArgument(isUnsignedInteger(blockchainUserPayload.nVersion), 'Expect nVersion to be an unsigned integer');
  Preconditions.checkArgument(isUnsignedInteger(blockchainUserPayload.creditFee), 'Expect creditFee to be an unsigned integer');

  Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.regTxId), 'expect regTxId to be a Buffer but got ' + typeof blockchainUserPayload.pubKeyId);
  Preconditions.checkArgument(blockchainUserPayload.regTxId.length === constants.SHA256_HASH_SIZE, 'Invalid regTxId size');

  Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.hashPrevSubTx), 'expect hashPrevSubTx to be a Buffer but got ' + typeof blockchainUserPayload.pubKeyId);
  Preconditions.checkArgument(blockchainUserPayload.hashPrevSubTx.length === constants.SHA256_HASH_SIZE, 'Invalid hashPrevSubTx size');

  Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.hashSTPacket), 'expect hashSTPacket to be a Buffer but got ' + typeof blockchainUserPayload.pubKeyId);
  Preconditions.checkArgument(blockchainUserPayload.hashSTPacket.length === constants.SHA256_HASH_SIZE, 'Invalid hashSTPacket size');


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
  return this;
};

/**
 * @param {Buffer|String} hashPrevSubTx - Buffer or hex string
 * @return {SubTxTransitionPayload}
 */
SubTxTransitionPayload.prototype.setHashPrevSubTx = function(hashPrevSubTx) {
  if (typeof hashPrevSubTx === 'string') {
    hashPrevSubTx = Buffer.from(hashPrevSubTx, 'hex');
  }
  this.hashPrevSubTx = BufferUtil.copy(hashPrevSubTx);
  return this;
};

/**
 * @param {Buffer|String} hashSTPacket - Buffer or hex string
 * @return {SubTxTransitionPayload}
 */
SubTxTransitionPayload.prototype.setHashSTPacket = function(hashSTPacket) {
  if (typeof hashSTPacket === 'string') {
    hashSTPacket = Buffer.from(hashSTPacket, 'hex');
  }
  this.hashSTPacket = BufferUtil.copy(hashSTPacket);
  return this;
};

/**
 * @param {number} creditFee
 * @return {SubTxTransitionPayload}
 */
SubTxTransitionPayload.prototype.setCreditFee = function(creditFee) {
  this.creditFee = creditFee;
  return this;
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
    regTxId: BufferUtil.copy(this.regTxId),
    hashPrevSubTx: BufferUtil.copy(this.hashPrevSubTx),
    creditFee: this.creditFee,
    hashSTPacket: BufferUtil.copy(this.hashSTPacket)
  };
  if (!options || (options && !options.skipSignature)) {
    payloadJSON.vchSig = BufferUtil.copy(this.vchSig);
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

/**
 * Copy payload instance
 * @return {SubTxTransitionPayload}
 */
SubTxTransitionPayload.prototype.copy = function copy() {
  return SubTxTransitionPayload.fromJSON(this.toJSON());
};

module.exports = SubTxTransitionPayload;