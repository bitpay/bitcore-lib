var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isSha256HexString = utils.isSha256HexString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;

/**
 * @typedef {Object} SubTxTopupPayloadJSON
 * @property {number} version
 * @property {string} regTxHash
 */

/**
 * @class SubTxTopupPayload
 * @property {number} version
 * @property {string} regTxHash
 */
function SubTxTopupPayload(payloadJSON) {
  AbstractPayload.call(this);

  if (payloadJSON) {
    this.version = payloadJSON.version;
    this.regTxHash = payloadJSON.regTxHash;

    this.validate();
  } else {
    this.version = CURRENT_PAYLOAD_VERSION;
  }
}

SubTxTopupPayload.prototype = Object.create(AbstractPayload.prototype);
SubTxTopupPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {SubTxTopupPayload}
 */
SubTxTopupPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new SubTxTopupPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  payload.regTxHash = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');

  if (!payloadBufferReader.finished()) {
    throw new Error('Failed to parse payload: raw payload is bigger than expected.');
  }

  payload.validate();
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|SubTxTopupPayloadJSON} payloadJson
 * @return {SubTxTopupPayload}
 */
SubTxTopupPayload.fromJSON = function fromJSON(payloadJson) {
  return new SubTxTopupPayload(payloadJson);
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
SubTxTopupPayload.prototype.validate = function() {
  Preconditions.checkArgument(isUnsignedInteger(this.version), 'Expect version to be an unsigned integer');
  Preconditions.checkArgument(isSha256HexString(this.regTxHash), 'Expect regTxHash to be a hex string representing sha256 hash');
  return true;
};

/**
 * Serializes payload to JSON
 * @return {SubTxTopupPayload}
 */
SubTxTopupPayload.prototype.toJSON = function toJSON() {
  this.validate();
  return {
    version: this.version,
    regTxHash: this.regTxHash
  }
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
SubTxTopupPayload.prototype.toBuffer = function toBuffer() {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);
  payloadBufferWriter.write(Buffer.from(this.regTxHash, 'hex').reverse());

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {SubTxTopupPayload}
 */
SubTxTopupPayload.prototype.copy = function copy() {
  return SubTxTopupPayload.fromJSON(this.toJSON());
};

module.exports = SubTxTopupPayload;