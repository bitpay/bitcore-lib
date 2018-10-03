var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var IP_ADDRESS_SIZE = constants.IP_ADDRESS_SIZE;

/**
 * @typedef {Object} ProUpServTxPayloadJSON
 * @property {number} version
 * @property {string} proTXHash
 * @property {string} ipAddress
 * @property {number} port
 * @property {string} scriptOperatorPayout
 * @property {string} inputsHash
 * @property {string} payloadSig
 */

/**
 * @class ProUpServTxPayload
 * @property {number} version
 * @property {string} proTXHash
 * @property {string} ipAddress
 * @property {number} port
 * @property {string} scriptOperatorPayout
 * @property {string} inputsHash
 * @property {string} payloadSig
 */
function ProUpServTxPayload(payloadJSON) {
  AbstractPayload.call(this);

  if (payloadJSON) {
    this.version = payloadJSON.version;
    this.proTXHash = payloadJSON.proTXHash;
    this.ipAddress = payloadJSON.ipAddress;
    this.port = payloadJSON.port;
    this.scriptOperatorPayout = payloadJSON.scriptOperatorPayout;
    this.inputsHash = payloadJSON.inputsHash;

    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }

    this.validate();
  } else {
    this.version = CURRENT_PAYLOAD_VERSION;
  }
}

ProUpServTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpServTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpServTxPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  // TODO: Check if need to reverse hash
  payload.proTXHash = payloadBufferReader.read(HASH_SIZE).toString('hex');

  /* As for now, we decided to keep an ip address.
  It looks like no one at the moment is using it except block explorers.
   */
  payload.ipAddress = payloadBufferReader.read(IP_ADDRESS_SIZE).toString('hex');
  payload.port = payloadBufferReader.readUInt16BE();
  var scriptOperatorPayoutSize = payloadBufferReader.readVarintNum();
  payload.scriptOperatorPayout = payloadBufferReader.read(scriptOperatorPayoutSize);
  payload.inputsHash = payloadBufferReader.read(HASH_SIZE);

  var signatureSize = payloadBufferReader.readVarintNum();

  if (signatureSize > 0) {
    payload.payloadSig = payloadBufferReader.read(signatureSize);
  }

  if (!payloadBufferReader.finished()) {
    throw new Error('Failed to parse payload: raw payload is bigger than expected.');
  }

  payload.validate();
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|ProUpServTxPayloadJSON} payloadJson
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.fromJSON = function fromJSON(payloadJson) {
  return new ProUpServTxPayload(payloadJson);
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
ProUpServTxPayload.prototype.validate = function() {
  Preconditions.checkArgument(isUnsignedInteger(this.version), 'Expect version to be an unsigned integer');

  //TODO
  Preconditions.checkArgument(isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
  Preconditions.checkArgument(isHexString(this.merkleRootMNList), 'expect merkleRootMNList to be a hex string but got ' + typeof this.merkleRootMNList);
  Preconditions.checkArgument(this.merkleRootMNList.length === constants.SHA256_HASH_SIZE * 2, 'Invalid merkleRootMNList size');
  return true;
};

/**
 * Serializes payload to JSON
 * @return {ProUpServTxPayloadJSON}
 */
ProUpServTxPayload.prototype.toJSON = function toJSON() {
  this.validate();
  return JSON.parse(JSON.stringify(this));
};

/**
 * Serialize payload to buffer
 * @param options
 * @param {Boolean} options.skipSignature - skip signature. Used for generating new signature
 * @return {Buffer}
 */
ProUpServTxPayload.prototype.toBuffer = function toBuffer(options) {
  var noSignature = Boolean(this.payloadSig);
  var skipSignature = noSignature || options.skipSignature;

  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);

  // TODO: Check if need to reverse hash
  payloadBufferWriter.write(Buffer.from(this.proTXHash, 'hex'));
  /* As for now, we decided to keep an ip address.
  It looks like no one at the moment is using it except block explorers.
  */
  payloadBufferWriter.write(Buffer.from(this.ipAddress, 'hex'));
  payloadBufferWriter.writeUInt16BE(this.port);

  var scriptOperatorPayout = Buffer.from(this.scriptOperatorPayout, 'hex');
  payloadBufferWriter.writeVarintNum(scriptOperatorPayout.length);
  payloadBufferWriter.write(scriptOperatorPayout);

  payloadBufferWriter.write(Buffer.from(this.inputsHash));

  var payloadSignature;

  if (skipSignature) {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  } else {
    payloadSignature = Buffer.from(this.payloadSig);
    payloadBufferWriter.writeVarintNum(payloadSignature.length);
    payloadBufferWriter.write(payloadSignature);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.prototype.copy = function copy() {
  return ProUpServTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpServTxPayload;