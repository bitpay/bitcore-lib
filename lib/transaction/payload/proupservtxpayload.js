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
function ProUpServTxPayload() {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
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

  // TODO: parse IP address
  payload.ipAddress = payloadBufferReader.read(IP_ADDRESS_SIZE);

  payload.port = payloadBufferReader.readUInt16LE();

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
  var payload = new ProUpServTxPayload();
  payload.version = payloadJson.version;
  payload.proTXHash = payloadJson.proTXHash;
  // TODO: figure out the best way to save an ip address, probably string
  payload.ipAddress = payloadJson.ipAddress;
  payload.port = payloadJson.port;
  payload.scriptOperatorPayout = payloadJson.scriptOperatorPayout;
  payload.inputsHash = payloadJson.inputsHash;

  if (payloadJson.payloadSig) {
    payload.payloadSig = payloadJson.payloadSig;
  }

  payload.validate();
  return payload;
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
 * @return {CoinbasePayloadJSON}
 */
ProUpServTxPayload.prototype.toJSON = function toJSON() {
  this.validate();
  return {
    version: this.version,
    height: this.height,
    merkleRootMNList: this.merkleRootMNList
  };
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
ProUpServTxPayload.prototype.toBuffer = function toBuffer() {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .writeUInt32LE(this.height)
    .write(Buffer.from(this.merkleRootMNList, 'hex'));

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