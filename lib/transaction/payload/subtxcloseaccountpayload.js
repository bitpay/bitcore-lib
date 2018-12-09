var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
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

/**
 * @typedef {Object} SubTxCloseAccountPayloadJSON
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - Signature from either the current key or a previous key (<= ~90 days old)
 */

/**
 * @class SubTxCloseAccountPayload
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - Signature from either the current key or a previous key (<= ~90 days old)
 */
function SubTxCloseAccountPayload(payloadJSON) {
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

SubTxCloseAccountPayload.prototype = Object.create(AbstractPayload.prototype);
SubTxCloseAccountPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {SubTxCloseAccountPayload}
 */
SubTxCloseAccountPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new SubTxCloseAccountPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  payload.regTxHash = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');
  payload.hashPrevSubTx = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');
  payload.creditFee = payloadBufferReader.readUInt64LEBN().toNumber();
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
 * @param {string|SubTxCloseAccountPayloadJSON} payloadJson
 * @return {SubTxCloseAccountPayload}
 */
SubTxCloseAccountPayload.fromJSON = function fromJSON(payloadJson) {
  return new SubTxCloseAccountPayload(payloadJson);
};

/**
 * @private
 * @param {string|PrivateKey} privateKey
 * @return {Buffer}
 */
SubTxCloseAccountPayload.convertPrivateKeyToPubKeyId = function(privateKey) {
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
SubTxCloseAccountPayload.prototype.validate = function() {
  Preconditions.checkArgumentType(this.version, 'number', 'version');
  Preconditions.checkArgumentType(this.creditFee, 'number', 'creditFee');
  Preconditions.checkArgument(isUnsignedInteger(this.version), 'Expect version to be an unsigned integer');
  Preconditions.checkArgument(isSha256HexString(this.regTxHash), 'Expect regTxHash to be a hex string representing sha256 hash');
  Preconditions.checkArgument(isSha256HexString(this.hashPrevSubTx), 'Expect hashPrevSubTx to be a hex string representing sha256 hash');
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
 * @return {SubTxCloseAccountPayload}
 */
SubTxCloseAccountPayload.prototype.setRegTxHash = function (regTxHash) {
  this.regTxHash = regTxHash;
  return this;
};

/**
 * @param {string} hashPrevSubTx
 * @return {SubTxCloseAccountPayload}
 */
SubTxCloseAccountPayload.prototype.setPrevSubTxHash = function (hashPrevSubTx) {
  this.hashPrevSubTx = hashPrevSubTx;
  return this;
};

/**
 * @param {number} duffs
 * @return {SubTxCloseAccountPayload}
 */
SubTxCloseAccountPayload.prototype.setCreditFee = function (duffs) {
  this.creditFee = duffs;
  return this;
};

/**
 * Serializes payload to JSON
 * @return {{version: *, regTxHash: *, hashPrevSubTx: *, creditFee: *, payloadSigSize: *, payloadSig: *}}
 */
SubTxCloseAccountPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature = options && options.skipSignature || false;
  this.validate();
  var payloadJSON = {
    version: this.version,
    regTxHash: this.regTxHash,
    hashPrevSubTx: this.hashPrevSubTx,
    creditFee: this.creditFee,
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
SubTxCloseAccountPayload.prototype.toBuffer = function toBuffer(options) {
  var skipSignature = options && options.skipSignature || false;
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);
  payloadBufferWriter.write(Buffer.from(this.regTxHash, 'hex').reverse());
  payloadBufferWriter.write(Buffer.from(this.hashPrevSubTx, 'hex').reverse());
  payloadBufferWriter.writeUInt64LEBN(new BigNumber(this.creditFee));
  if (!skipSignature) {
    payloadBufferWriter.writeVarintNum(this.payloadSigSize);
    payloadBufferWriter.write(Buffer.from(this.payloadSig, 'hex').reverse());
  } else {
    payloadBufferWriter.writeVarintNum(0);
  }
  return payloadBufferWriter.toBuffer();
};

module.exports = SubTxCloseAccountPayload;
