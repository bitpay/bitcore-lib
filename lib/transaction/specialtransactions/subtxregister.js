var Transaction = require('../transaction');
var TRANSACTION_SUBTX_REGISTER = require('./registeredtypes').TRANSACTION_SUBTX_REGISTER;
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
 * @property {BlockchainUserPayload} payload
 */
function SubTxRegister(serialized) {
  Transaction.call(this, serialized);

  if (serialized) {
    if (this.type !== TRANSACTION_SUBTX_REGISTER ) {
      throw new Error('Expected transaction type to be equal '+TRANSACTION_SUBTX_REGISTER+', but got'+this.type);
    }
    this.payload = SubTxRegister.parsePayload(this.extraPayload);
  } else {
    this.initEmptyTransaction();
  }
}

SubTxRegister.prototype = Object.create(Transaction.prototype);
SubTxRegister.prototype.constructor = SubTxRegister;

/**
 * @private
 * Initializes empty registration transaction
 */
SubTxRegister.prototype.initEmptyTransaction = function initEmptyTransaction() {
  this.setSpecialTransactionType(TRANSACTION_SUBTX_REGISTER);
  this.blockchainUserPayload = {
    nVersion: CURRENT_PAYLOAD_VERSION,
  };
};

/**
 * Serializes transaction to buffer
 * @return {Buffer}
 */
SubTxRegister.prototype.toBuffer = function() {
  this.setExtraPayload(SubTxRegister.serializePayload(this.blockchainUserPayload));
  return Transaction.prototype.toBuffer.call(this);
};

SubTxRegister.prototype.fromBuffer = function(buffer) {
  Transaction.prototype.fromBuffer.call(this);
  this.payload = SubTxRegister.parsePayload(this.extraPayload);
};

/**
 * Serializes transaction to hex string
 * @param {boolean} unsafe
 * @return {string}
 */
SubTxRegister.prototype.serialize = function(unsafe) {
  this.setExtraPayload(SubTxRegister.serializePayload(this.blockchainUserPayload));
  return Transaction.prototype.serialize.call(this, unsafe);
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