var RegisteredPayloadTypes = require('../constants').registeredTransactionTypes;
var AbstractPayload = require('./abstractpayload');
var SubTxRegisterPayload = require('./subtxregisterpayload');
var SubTxTransitionPayload = require('./subtxtransitionpayload');

/**
 * Parses payload and returns instance of payload to work with
 * @param {number} payloadType
 * @param {Buffer} rawPayload
 * @return {AbstractPayload}
 */
function parsePayloadBuffer(payloadType, rawPayload) {
  switch (payloadType) {
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_REGISTER:
      return SubTxRegisterPayload.parsePayloadBuffer(rawPayload);
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_TRANSITION:
      return SubTxTransitionPayload.parsePayloadBuffer(rawPayload);
    default:
      throw new Error('Can not parse payload - Unknown special transaction type');
  }
}

/**
 * @param {Number} payloadType
 * @param {Object} payloadJson
 * @return {AbstractPayload}
 */
function parsePayloadJSON(payloadType, payloadJson) {
  switch (payloadType) {
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_REGISTER:
      return SubTxRegisterPayload.parsePayloadJSON(payloadJson);
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_TRANSITION:
      return SubTxTransitionPayload.parsePayloadJSON(payloadJson);
    default:
      throw new Error('Can not parse payload - Unknown special transaction type');
  }
}

/**
 * Serializes payload
 * @param {AbstractPayload} payload
 * @return {Buffer}
 */
function serializePayloadToBuffer(payload) {
  return payload.toBuffer();
}

/**
 * Serializes payload to JSON
 * @param payload
 * @return {Object}
 */
function serializePayloadToJSON(payload) {
  return payload.toJSON();
}

module.exports = {
  parsePayloadBuffer: parsePayloadBuffer,
  parsePayloadJSON: parsePayloadJSON,
  serializePayloadToBuffer: serializePayloadToBuffer,
  serializePayloadToJSON: serializePayloadToJSON
};