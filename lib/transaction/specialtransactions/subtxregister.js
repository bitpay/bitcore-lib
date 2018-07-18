var SPECIAL_TRANSACTION_TYPE = require('./registeredtypes').TRANSACTION_SUBTX_REGISTER;
var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferUtil = require('../../util/buffer');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');

var CURRENT_PAYLOAD_VERSION = 1;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;

/**
 * @typedef {Object} BlockchainUserPayload
 * @property {number} nVersion - payload version
 * @property {string} pubKeyId
 * @property {string} userName
 * @property {Buffer} vchSig
 */

/**
 * Blockchain User Registration special transaction
 * @class
 * @constructor
 */
function SubTxRegister(serialized) {

}

/**
 * @private
 * Initializes empty registration transaction
 */
SubTxRegister.prototype.init = function init() {
  this.blockchainUserPayload = {
    nVersion: CURRENT_PAYLOAD_VERSION,
  };
};

//TODO: make those methods abstract

/**
 * Serialize blockchain user payload
 * @param {BlockchainUserPayload} blockchainUserPayload
 * @return {Buffer} serialized payload
 */
SubTxRegister.serializePayload = function serializePayload(blockchainUserPayload) {
  SubTxRegister.validatePayload(blockchainUserPayload);
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

  return payloadBufferWriter.toBuffer();
};

/**
 * Parse raw blockchain user payload
 * @param {Buffer} rawPayload
 * @return {BlockchainUserPayload}
 */
SubTxRegister.parsePayload = function parsePayload(rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var blockchainUserPayload = {};

  blockchainUserPayload.nVersion = payloadBufferReader.readUInt16LE();
  var usernameLen = payloadBufferReader.readVarintNum();
  blockchainUserPayload.userName = payloadBufferReader.read(usernameLen).toString();
  blockchainUserPayload.pubKeyId = payloadBufferReader.read(PUBKEY_ID_SIZE).toString('hex');

  if (!payloadBufferReader.finished()) {
    var signatureLength = payloadBufferReader.readVarintNum();
    blockchainUserPayload.vchSig = payloadBufferReader.read(signatureLength);
  }

  SubTxRegister.validatePayload(blockchainUserPayload);
  return blockchainUserPayload;
};

// TODO

/**
 * Validate payload
 * @param {BlockchainUserPayload} blockchainUserPayload
 * @return {boolean}
 */
SubTxRegister.validatePayload = function validatePayload(blockchainUserPayload) {
  if (!blockchainUserPayload) {
    throw new Error('No Payload specified');
  }

  Preconditions.checkArgumentType(blockchainUserPayload.nVersion, 'number');
  Preconditions.checkArgument(blockchainUserPayload.pubKeyId, 'string');
  Preconditions.checkArgument(BufferUtil.isBuffer(blockchainUserPayload.vchSig), 'User signature is missing');
  Preconditions.checkArgumentType(blockchainUserPayload.userName, 'string');
  Preconditions.checkArgument(blockchainUserPayload.userName.length < 1, 'User name is too short');
};

SubTxRegister.signPayload = function(rawPayload) {};
SubTxRegister.setPubKeyId = function(pubKeyId) {};
SubTxRegister.convertPrivateKeyToPubKeyId =function(privateKey) {
  return privateKey.toPublicKey()._getID();
};

module.exports = SubTxRegister;