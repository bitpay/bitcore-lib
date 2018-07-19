var constants = require('../constants');
var Preconditions = require('../../../util/preconditions');
var BufferUtil = require('../../../util/buffer');
var BufferWriter = require('../../../encoding/bufferwriter');
var BufferReader = require('../../../encoding/bufferreader');
var Hash = require('../../../crypto/hash');

var CURRENT_PAYLOAD_VERSION = 1;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;

/**
 * @typedef {Object} BlockchainUserPayload
 * @property {number} nVersion - payload version
 * @property {string} pubKeyId
 * @property {string} userName
 * @property {string} vchSig
 */

/**
 * @class SubTxRegisterPayload
 * @property {number} nVersion - payload version
 * @property {string} pubKeyId
 * @property {string} userName
 * @property {Buffer} vchSig
 */
function SubTxRegisterPayload() {
  this.nVersion = CURRENT_PAYLOAD_VERSION;
}

/* Static methods */

/**
 * Serialize blockchain user payload
 * @param {BlockchainUserPayload} blockchainUserPayload
 * @return {Buffer} serialized payload
 */
SubTxRegisterPayload.serializeJSONToBuffer = function serializePayload(blockchainUserPayload) {
  SubTxRegisterPayload.validateJSONPayload(blockchainUserPayload);
  var payloadBufferWriter = new BufferWriter();

  var userNameBuffer = Buffer.from(blockchainUserPayload.userName, 'utf8');

  return payloadBufferWriter
    .writeUInt16LE(blockchainUserPayload.nVersion)
    .writeVarintNum(userNameBuffer.length)
    .write(userNameBuffer)
    .write(blockchainUserPayload.pubKeyId)
    .writeVarintNum(blockchainUserPayload.vchSig.length)
    .write(blockchainUserPayload.vchSig)
    .toBuffer();
};

/**
 * Parse raw blockchain user payload
 * @param {Buffer} rawPayload
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.parsePayload = function parsePayload(rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var blockchainUserPayload = new SubTxRegisterPayload();

  blockchainUserPayload.nVersion = payloadBufferReader.readUInt16LE();
  var usernameLen = payloadBufferReader.readVarintNum();
  blockchainUserPayload.userName = payloadBufferReader.read(usernameLen).toString();
  blockchainUserPayload.pubKeyId = payloadBufferReader.read(PUBKEY_ID_SIZE).toString('hex');

  if (!payloadBufferReader.finished()) {
    var signatureLength = payloadBufferReader.readVarintNum();
    blockchainUserPayload.vchSig = payloadBufferReader.read(signatureLength);
  }

  SubTxRegisterPayload.validateJSONPayload(blockchainUserPayload.toJSON());
  return blockchainUserPayload;
};

/**
 * Validate payload
 * @param {BlockchainUserPayload} blockchainUserPayload
 * @return {boolean}
 */
SubTxRegisterPayload.validateJSONPayload = function validatePayload(blockchainUserPayload) {
  if (!blockchainUserPayload) {
    throw new Error('No Payload specified');
  }

  Preconditions.checkArgumentType(blockchainUserPayload.nVersion, 'number');
  Preconditions.checkArgument(blockchainUserPayload.pubKeyId, 'string');
  // Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.vchSig), 'User signature is missing');
  Preconditions.checkArgumentType(blockchainUserPayload.userName, 'string');
  Preconditions.checkArgument(blockchainUserPayload.userName.length < 1, 'User name is too short');
};

/**
 * Returns signature for the payload
 * @param {Buffer} rawPayload
 * @param {PrivateKey} privateKey
 */
SubTxRegisterPayload.signPayload = function(rawPayload, privateKey) {};

SubTxRegisterPayload.convertPrivateKeyToPubKeyId = function(privateKey) {
  return privateKey.toPublicKey()._getID();
};

/* Instance methods */

/**
 * @param userName
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.prototype.setUserName = function setUserName(userName) {
  this.userName = userName;
  return this;
};

/**
 * @param pubKeyId
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.prototype.setPubKeyId = function(pubKeyId) {
  this.pubKeyId = pubKeyId;
  return this;
};

SubTxRegisterPayload.prototype.sign = function sign(privateKey) {
  var payloadHash = this.getHash({ skipSignature: true });
  return this;
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {BlockchainUserPayload}
 */
SubTxRegisterPayload.prototype.toJSON = function toJSON(options) {
  var payloadJSON = {
    nVersion: this.nVersion,
    userName: this.userName,
    pubKeyId: this.pubKeyId,
    vchSig: BufferUtil.emptyBuffer(0)
  };
  if (options && !options.skipSignature) {
    payloadJSON.vchSig = this.vchSig;
  }
  SubTxRegisterPayload.validateJSONPayload(payloadJSON);
  return payloadJSON;
};

/**
 * Serialized payload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
SubTxRegisterPayload.prototype.toBuffer = function toBuffer(options) {
  return SubTxRegisterPayload.serializeJSONToBuffer(this.toJSON(options));
};

/**
 * Returns payload hash
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
SubTxRegisterPayload.prototype.getHash = function getHash(options) {
  return Hash.sha256sha256(this.toBuffer(options));
};

module.exports = SubTxRegisterPayload;