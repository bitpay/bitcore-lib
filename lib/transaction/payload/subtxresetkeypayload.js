var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferUtil = require('../../util/buffer');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
var PrivateKey = require('../../privatekey');
var BigNumber = require('bn.js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isSha256HexString = utils.isSha256HexString;
var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;

/**
 * @typedef {Object} SubTxResetKeyPayloadJSON
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} newPubKeySize - length of the new public key (not present in implementation)
 * @property {Buffer} newPubKey
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - signature of most recent pubkey
 */

/**
 * @class SubTxResetKeyPayload
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} newPubKeySize - length of the new public key (not present in implementation)
 * @property {Buffer} newPubKey
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - signature of most recent pubkey
 */
function SubTxResetKeyPayload(payloadJSON) {
  AbstractPayload.call(this);

  if (payloadJSON) {
    this.version = payloadJSON.version;
    this.regTxHash = payloadJSON.regTxHash;
    this.hashPrevSubTx = payloadJSON.hashPrevSubTx;
    this.creditFee = payloadJSON.creditFee;
    //this.newPubKeySize = payloadJSON.newPubKeySize;
    this.newPubKey = payloadJSON.newPubKey;
    this.payloadSigSize = 0;
    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
      this.payloadSigSize = Number(this.payloadSig.length) / 2;
    }

    this.validate();
  } else {
    this.version = CURRENT_PAYLOAD_VERSION;
  }
}

SubTxResetKeyPayload.prototype = Object.create(AbstractPayload.prototype);
SubTxResetKeyPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new SubTxResetKeyPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  payload.regTxHash = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');
  payload.hashPrevSubTx = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');
  payload.creditFee = payloadBufferReader.readUInt64LEBN().toNumber();
  // TODO: enable following two lines when bug is fixed and core implementation corresponds to DIP5
  //payload.newPubKeySize = payloadBufferReader.readVarintNum();
  //payload.newPubKey = payloadBufferReader.read(payload.newPubKeySize);
  payload.newPubKey = payloadBufferReader.read(PUBKEY_ID_SIZE);
  payload.payloadSigSize = payloadBufferReader.readVarintNum();

  if (!payloadBufferReader.finished()) {
    payload.payloadSig = payloadBufferReader.read(payload.payloadSigSize).reverse().toString('hex');
  }

  if (!payloadBufferReader.finished()) {
    throw new Error('Failed to parse payload: raw payload is bigger than expected.');
  }

  payload.validate();
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|SubTxResetKeyPayloadJSON} payloadJson
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.fromJSON = function fromJSON(payloadJson) {
  return new SubTxResetKeyPayload(payloadJson);
};

/**
 * @private
 * @param {string|PrivateKey} privateKey
 * @return {Buffer}
 */
SubTxResetKeyPayload.convertPrivateKeyToPubKeyId = function(privateKey) {
  if (typeof privateKey === 'string') {
    privateKey = new PrivateKey(privateKey);
  }
  return privateKey.toPublicKey()._getID();
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
SubTxResetKeyPayload.prototype.validate = function() {
  Preconditions.checkArgumentType(this.version, 'number', 'version');
  Preconditions.checkArgumentType(this.creditFee, 'number', 'creditFee');
  // TODO: enable following two checks when bug is fixed and core implementation corresponds to DIP5
  //Preconditions.checkArgumentType(this.newPubKeySize, 'number', 'newPubKeySize');
  Preconditions.checkArgument(isUnsignedInteger(this.version), 'Expect version to be an unsigned integer');
  Preconditions.checkArgument(isSha256HexString(this.regTxHash), 'Expect regTxHash to be a hex string representing sha256 hash');
  Preconditions.checkArgument(isSha256HexString(this.hashPrevSubTx), 'Expect hashPrevSubTx to be a hex string representing sha256 hash');
  Preconditions.checkArgument(isUnsignedInteger(this.creditFee), 'Expect creditFee to be an unsigned integer');
  // TODO: change following checks if necessary once DIP 5 payloads will be updated with BLS keys and signatures
  // TODO: enable following two checks when bug is fixed and core implementation corresponds to DIP5
  //Preconditions.checkArgument(isUnsignedInteger(this.newPubKeySize), 'Expect newPubKeySize to be an unsigned integer');
  //Preconditions.checkArgument(this.newPubKeySize === constants.PUBKEY_ID_SIZE, 'Invalid newPubKeySize size');
  Preconditions.checkArgument(BufferUtil.isBuffer(this.newPubKey), 'expect newPubKey to be a Buffer but got ' + typeof this.newPubKey);
  if (this.payloadSig && this.payloadSigSize !== 0) {
    Preconditions.checkArgumentType(this.payloadSigSize, 'number', 'payloadSigSize');
    Preconditions.checkArgument(isHexString(this.payloadSig), 'expect payloadSig to be a hex string but got ' + typeof this.payloadSig);
    Preconditions.checkArgument(isUnsignedInteger(this.payloadSigSize), 'Expect payloadSigSize to be an unsigned integer');
    Preconditions.checkArgument(this.payloadSigSize === constants.COMPACT_SIGNATURE_SIZE, 'Invalid payloadSigSize size');
    Preconditions.checkArgument(this.payloadSig.length === constants.COMPACT_SIGNATURE_SIZE * 2, 'Invalid Argument: Invalid payloadSigSize size');
  }
  return true;
};

/**
 * @param {string} regTxHash
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.prototype.setRegTxHash = function (regTxHash) {
  this.regTxHash = regTxHash;
  return this;
};

/**
 * @param {string} hashPrevSubTx
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.prototype.setPrevSubTxHash = function (hashPrevSubTx) {
  this.hashPrevSubTx = hashPrevSubTx;
  return this;
};

/**
 * @param {number} duffs
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.prototype.setCreditFee = function (duffs) {
  this.creditFee = duffs;
  return this;
};

/**
 * @param {Buffer} pubKeyId
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.prototype.setNewPubKeyId = function(pubKeyId) {
  this.newPubKey = BufferUtil.copy(pubKeyId);
  return this;
};

/**
 * Extracts and sets pubKeyId from private key
 * @param {string|PrivateKey} privateKey
 * @return {SubTxResetKeyPayload}
 */
SubTxResetKeyPayload.prototype.setPubKeyIdFromPrivateKey = function (privateKey) {
  this.setNewPubKeyId(SubTxResetKeyPayload.convertPrivateKeyToPubKeyId(privateKey));
  return this;
};

/**
 * Serializes payload to JSON
 * @return {{version: *, regTxHash: *, hashPrevSubTx: *, creditFee: *, newPubKeySize: *, newPubKey: *, payloadSigSize: *, payloadSig: *}}
 */
SubTxResetKeyPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature = options && options.skipSignature || false;
  this.validate();
  var payloadJSON = {
    version: this.version,
    regTxHash: this.regTxHash,
    hashPrevSubTx: this.hashPrevSubTx,
    creditFee: this.creditFee,
    // TODO: enable following line when bug is fixed and core implementation corresponds to DIP5
    //newPubKeySize: this.newPubKeySize,
    newPubKey: this.newPubKey,
  };
  if (!skipSignature) {
    payloadJSON.payloadSigSize = this.payloadSigSize;
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
SubTxResetKeyPayload.prototype.toBuffer = function toBuffer(options) {
  var skipSignature = options && options.skipSignature || false;
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);
  payloadBufferWriter.write(Buffer.from(this.regTxHash, 'hex').reverse());
  payloadBufferWriter.write(Buffer.from(this.hashPrevSubTx, 'hex').reverse());
  payloadBufferWriter.writeUInt64LEBN(new BigNumber(this.creditFee));
  // TODO: enable following line when bug is fixed and core implementation corresponds to DIP5
  //payloadBufferWriter.writeVarintNum(this.newPubKeySize);
  payloadBufferWriter.write(this.newPubKey);
  if (!skipSignature) {
    payloadBufferWriter.writeVarintNum(this.payloadSigSize);
    payloadBufferWriter.write(Buffer.from(this.payloadSig, 'hex').reverse());
  } else {
    payloadBufferWriter.writeVarintNum(0);
  }
  return payloadBufferWriter.toBuffer();
};

module.exports = SubTxResetKeyPayload;
