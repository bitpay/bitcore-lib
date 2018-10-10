var constants = require('./constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
var Script = require('../../script');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;
var isSha256HexString = utils.isSha256HexString;

var CURRENT_PAYLOAD_VERSION = 1;
var CURRENT_PROTOCOL_VERSION = constants.CURRENT_PROTOCOL_VERSION;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var IP_ADDRESS_SIZE = constants.IP_ADDRESS_SIZE;

/**
 * @typedef {Object} ProUpServTxPayloadJSON
 * @property {number} version
 * @property {string} proTXHash
 * @property {string} ipAddress
 * @property {number} port
 * @property {string} [scriptOperatorPayout]
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 * @property {number} protocolVersion
 */

/**
 * @class ProUpServTxPayload
 * @property {number} version
 * @property {string} proTXHash
 * @property {string} ipAddress
 * @property {number} port
 * @property {string} [scriptOperatorPayout]
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 * @property {number} protocolVersion
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
    this.protocolVersion = payloadJSON.protocolVersion || CURRENT_PROTOCOL_VERSION;

    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }

    this.validate();
  } else {
    this.version = CURRENT_PAYLOAD_VERSION;
    this.protocolVersion = CURRENT_PROTOCOL_VERSION;
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
  payload.proTXHash = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');

  // Protocol version is going to be removed
  payload.protocolVersion = payloadBufferReader.readUInt32LE();
  /* As for now, we decided to keep an ip address.
  It looks like no one at the moment is using it except block explorers.
   */
  payload.ipAddress = payloadBufferReader.read(IP_ADDRESS_SIZE).toString('hex');
  // var ipv6 = payload.ipAddress.match(/.{1,4}/g).join(':');
  payload.port = payloadBufferReader.readUInt16BE();
  var port = payload.port;
  // Note: can be 0 if not updated!
  var scriptOperatorPayoutSize = payloadBufferReader.readVarintNum();
  payload.scriptOperatorPayout = payloadBufferReader.read(scriptOperatorPayoutSize).toString('hex');
  payload.inputsHash = payloadBufferReader.read(HASH_SIZE).reverse().toString('hex');

  var signatureSize = payloadBufferReader.readVarintNum();

  if (signatureSize > 0) {
    payload.payloadSig = payloadBufferReader.read(signatureSize).toString('hex');
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
  Preconditions.checkArgument(isSha256HexString(this.proTXHash), 'Expect proTXHash to be a hex string representing sha256 hash');

  Preconditions.checkArgument(isHexString(this.ipAddress), 'Expect ipAddress to be a hex string');
  Preconditions.checkArgument(this.ipAddress.length === IP_ADDRESS_SIZE * 2, 'Expect ipAddress to be a hex string representing an ipv6 address');

  Preconditions.checkArgument(isUnsignedInteger(this.port), 'Expect port to be an unsigned integer');
  Preconditions.checkArgument(isSha256HexString(this.inputsHash), 'Expect inputsHash to be a hex string representing sha256 hash');

  Preconditions.checkArgument(isUnsignedInteger(this.protocolVersion), 'Expect protocolVersion to be an unsigned integer');

  if (this.scriptOperatorPayout) {
    var script = new Script(this.scriptOperatorPayout);
    Preconditions.checkArgument(script.isPublicKeyHashOut() || script.isScriptHashOut(), 'Expected scriptOperatorPayout to be a p2pkh/p2sh');
  }

  if (Boolean(this.payloadSig)) {
    Preconditions.checkArgument(isHexString(this.payloadSig), 'Expect payload sig to be a hex string');
  }
  return true;
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param options.skipSignature
 * @return {ProUpServTxPayloadJSON}
 */
ProUpServTxPayload.prototype.toJSON = function toJSON(options) {
  this.validate();
  /**
   * @type {ProUpServTxPayloadJSON}
   */
  var payloadJSON = {
    version: this.version,
    proTXHash: this.proTXHash,
    ipAddress: this.ipAddress,
    port: this.port,
    scriptOperatorPayout: this.scriptOperatorPayout,
    inputsHash: this.inputsHash,
    protocolVersion: this.protocolVersion
  };
  if (options && !options.skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature. Used for generating new signature
 * @return {Buffer}
 */
ProUpServTxPayload.prototype.toBuffer = function toBuffer(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);

  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);

  payloadBufferWriter.write(Buffer.from(this.proTXHash, 'hex').reverse());
  /* As for now, we decided to keep an ip address.
  It looks like no one at the moment is using it except block explorers.
  */
  payloadBufferWriter.writeUInt32LE(this.protocolVersion);
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
    payloadSignature = Buffer.from(this.payloadSig, 'hex');
    payloadBufferWriter.writeVarintNum(payloadSignature);
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