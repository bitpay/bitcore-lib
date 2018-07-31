var utils = require('../../../util/js');
var constants = require('../constants');
var Preconditions = require('../../../util/preconditions');
var BufferUtil = require('../../../util/buffer');
var BufferWriter = require('../../../encoding/bufferwriter');
var BufferReader = require('../../../encoding/bufferreader');
var PrivateKey = require('../../../privatekey');
var AbstractPayload = require('./abstractpayload');

var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;

/**
 * @typedef {Object} BlockchainUserPayloadJSON
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
 * @property {string} [vchSig]
 */
function SubTxRegisterPayload() {
  AbstractPayload.call(this);
  this.nVersion = CURRENT_PAYLOAD_VERSION;
}

SubTxRegisterPayload.prototype = Object.create(AbstractPayload.prototype);
SubTxRegisterPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Serialize blockchain user payload
 * @param {BlockchainUserPayloadJSON} blockchainUserPayload
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
      payloadBufferWriter.write(Buffer.from(blockchainUserPayload.vchSig, 'hex'));
    }

    return payloadBufferWriter.toBuffer();
};

/**
 * Parse raw blockchain user payload
 * @param {Buffer} rawPayload
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.fromBuffer = function fromBuffer(rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var blockchainUserPayload = new SubTxRegisterPayload();

  blockchainUserPayload.nVersion = payloadBufferReader.readUInt16LE();
  var usernameLen = payloadBufferReader.readVarintNum();
  blockchainUserPayload.userName = payloadBufferReader.read(usernameLen).toString();
  blockchainUserPayload.pubKeyId = payloadBufferReader.read(PUBKEY_ID_SIZE);

  if (!payloadBufferReader.finished()) {
    blockchainUserPayload.vchSig = payloadBufferReader.read(constants.COMPACT_SIGNATURE_SIZE).toString('hex');
  }

  SubTxRegisterPayload.validatePayloadJSON(blockchainUserPayload.toJSON());
  return blockchainUserPayload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|BlockchainUserPayloadJSON} payloadJson
 * @return {SubTxRegisterPayload}
 */
SubTxRegisterPayload.fromJSON = function fromJSON(payloadJson) {
  SubTxRegisterPayload.validatePayloadJSON(payloadJson);
  var payload = new SubTxRegisterPayload();
  payload.nVersion = payloadJson.nVersion;
  payload.setUserName(payloadJson.userName);
  payload.setPubKeyId(payloadJson.pubKeyId);
  if (Boolean(payloadJson.vchSig)) {
    payload.vchSig = payloadJson.vchSig;
  }
  return payload;
};

/**
 * Validate payload
 * @param {BlockchainUserPayloadJSON} blockchainUserPayload
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
    Preconditions.checkArgument(isHexString(blockchainUserPayload.vchSig), 'expect vchSig to be a hex string but got ' + typeof blockchainUserPayload.vchSig);
    Preconditions.checkArgument(blockchainUserPayload.vchSig.length === constants.COMPACT_SIGNATURE_SIZE * 2, 'Invalid vchSig size');
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
 * Serializes payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {BlockchainUserPayloadJSON}
 */
SubTxRegisterPayload.prototype.toJSON = function toJSON(options) {
  var payloadJSON = {
    nVersion: this.nVersion,
    userName: this.userName,
    pubKeyId: this.pubKeyId
  };
  if (!options || (options && !options.skipSignature)) {
    payloadJSON.vchSig = this.vchSig;
  }
  SubTxRegisterPayload.validatePayloadJSON(payloadJSON);
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
SubTxRegisterPayload.prototype.toBuffer = function toBuffer(options) {
  return SubTxRegisterPayload.serializeJSONToBuffer(this.toJSON(options));
};

module.exports = SubTxRegisterPayload;