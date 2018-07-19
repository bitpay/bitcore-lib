const RegisteredPayloadTypes = require('../constants').registeredTransactionTypes;
const SubTxRegisterPayload = require('./subtxregisterpayload');

/**
 * Parses payload and returns instance of payload to work with
 * @param {number} payloadType
 * @param {Buffer} rawPayload
 * @return {SubTxRegisterPayload}
 */
function parsePayloadBuffer(payloadType, rawPayload) {
  switch (payloadType) {
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_REGISTER:
      return SubTxRegisterPayload.parsePayloadBuffer(rawPayload);
    default:
      throw new Error('Can not parse payload - Unknown special transaction type');
  }
}

function parsePayloadJSON(payloadType, payloadJson) {
  switch (payloadType) {
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_REGISTER:
      return SubTxRegisterPayload.parsePayloadJSON(payloadJson);
    default:
      throw new Error('Can not parse payload - Unknown special transaction type');
  }
}

/**
 * Serializes payload
 * @param {SubTxRegisterPayload} payload
 * @return {Buffer}
 */
function serializePayloadToBuffer(payload) {
  return payload.toBuffer();
}

/**
 * Serializes payload to JSON
 * @param payload
 * @return {*}
 */
function serializePayloadToJSON(payload) {
  return payload.toJSON();
}

module.exports = {
  parsePayloadBuffer: parsePayloadBuffer,
  parsePayloadJSON: parsePayloadJSON,
  serializePayloadToBuffer: serializePayloadToBuffer,
  serializePayloadToJSON: serializePayloadToJSON,
};