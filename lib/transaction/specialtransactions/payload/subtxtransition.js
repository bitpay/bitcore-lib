var constants = require('../constants');
var Preconditions = require('../../../util/preconditions');
var BufferUtil = require('../../../util/buffer');
var BufferWriter = require('../../../encoding/bufferwriter');
var BufferReader = require('../../../encoding/bufferreader');
var Hash = require('../../../crypto/hash');
var PrivateKey = require('../../../privatekey');
var MessageSigner = require('../../../message');
var Signature = require('../../../crypto/signature');
var ECDSA = require('../../../crypto/ecdsa');

var CURRENT_PAYLOAD_VERSION = 1;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;

/**
 * @typedef {Object} BlockchainUserPayload
 * @property {number} nVersion - payload version
 * @property {Buffer} pubKeyId
 * @property {string} userName
 * @property {string} [vchSig]
 */

/**
 * @class SubTxRegisterPayload
 * @property {number} nVersion - payload version
 * @property {Buffer} pubKeyId
 * @property {string} userName
 * @property {Buffer} [vchSig]
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
SubTxRegisterPayload.serializeJSONToBuffer = function (blockchainUserPayload) {
  SubTxRegisterPayload.validatePayloadJSON(blockchainUserPayload);
  var payloadBufferWriter = new BufferWriter();

  var userNameBuffer = Buffer.from(blockchainUserPayload.userName, 'utf8');

  payloadBufferWriter
    .writeUInt16LE(blockchainUserPayload.nVersion)
    .writeVarintNum(userNameBuffer.length)
    .write(userNameBuffer)
    .write(blockchainUserPayload.pubKeyId);

  if (blockchainUserPayload.vchSig) {
    payloadBufferWriter.write(blockchainUserPayload.vchSig);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Parse raw blockchain user payload
 * @param {Buffer} rawPayload
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.parsePayloadBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var blockchainUserPayload = new SubTxRegisterPayload();

  blockchainUserPayload.nVersion = payloadBufferReader.readUInt16LE();
  var usernameLen = payloadBufferReader.readVarintNum();
  blockchainUserPayload.userName = payloadBufferReader.read(usernameLen).toString();
  blockchainUserPayload.pubKeyId = payloadBufferReader.read(PUBKEY_ID_SIZE);

  if (!payloadBufferReader.finished()) {
    blockchainUserPayload.vchSig = payloadBufferReader.read(constants.SUBTXREGISTER_SIGNATURE_SIZE);
  }

  SubTxRegisterPayload.validatePayloadJSON(blockchainUserPayload.toJSON());
  return blockchainUserPayload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|BlockchainUserPayload} payloadJson
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.parsePayloadJSON = function parsePayloadJSON(payloadJson) {
  SubTxRegisterPayload.validatePayloadJSON(payloadJson);
  var payload = new SubTxRegisterPayload();
  payload.nVersion = payloadJson.nVersion;
  payload.setUserName(payloadJson.userName);
  payload.setPubKeyId(payloadJson.pubKeyId);
  payload.vchSig = BufferUtil.copy(payloadJson.vchSig);
  return payload;
};

/**
 * Validate payload
 * @param {BlockchainUserPayload} blockchainUserPayload
 * @return {boolean}
 */
SubTxRegisterPayload.validatePayloadJSON = function (blockchainUserPayload) {
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
    Preconditions.checkArgument(blockchainUserPayload.vchSig.length === constants.SUBTXREGISTER_SIGNATURE_SIZE, 'Invalid vchSig size');
  }
};

/**
 * @private
 * @param {string|PrivateKey} privateKey
 * @return {Buffer}
 */
SubTxRegisterPayload.convertPrivateKeyToPubKeyId = function(privateKey) {
  if (typeof privateKey === 'string') {
    privateKey = new PrivateKey(privateKey);
  }
  return privateKey.toPublicKey()._getID();
};

/* Instance methods */

/**
 * @param {string} userName
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.prototype.setUserName = function setUserName(userName) {
  this.userName = userName;
  return this;
};

/**
 * @param {Buffer} pubKeyId
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.prototype.setPubKeyId = function(pubKeyId) {
  this.pubKeyId = BufferUtil.copy(pubKeyId);
  return this;
};

/**
 * Extracts and sets pubKeyId from private key
 * @param {string|PrivateKey} privateKey
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.prototype.setPubKeyIdFromPrivateKey = function (privateKey) {
  this.setPubKeyId(SubTxRegisterPayload.convertPrivateKeyToPubKeyId(privateKey));
  return this;
};

/**
 * Sign payload. The signature used later to prove ownership of the user name.
 * @param {string|PrivateKey} privateKey
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.prototype.sign = function sign(privateKey) {
  if (typeof privateKey === 'string') {
    privateKey = new PrivateKey(privateKey);
  }
  var payloadHash = this.getHash({ skipSignature: true });
  var signer = new MessageSigner(payloadHash.toString());
  this.vchSig = Buffer.from(signer.sign(privateKey), 'base64');
  return this;
};

/**
 * Verifies data signature against public key id
 * @param {Buffer|string} publicKeyId - Buffer or hex string
 * @return {boolean}
 */
SubTxRegisterPayload.prototype.verifySignature = function(publicKeyId) {
  var payloadHash = this.getHash({ skipSignature: true });
  return hashSigner.verifySignature();
};

SubTxRegisterPayload.prototype.toJSON = function toJSON() {
  throw new Error('Not Implemented');
};

SubTxRegisterPayload.prototype.toBuffer = function toBuffer() {
  throw new Error('Not Implemented');
};

SubTxRegisterPayload.prototype.toString = function() {
  return this.toBuffer().toString('hex');
};

SubTxRegisterPayload.prototype.getHash = function getHash() {
  return Hash.sha256sha256(this.toBuffer());
};

module.exports = SubTxRegisterPayload;