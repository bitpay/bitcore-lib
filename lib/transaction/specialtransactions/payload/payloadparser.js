const RegisteredPayloadTypes = require('../constants').registeredTransactionTypes;
const SubTxRegisterPayload = require('./subtxregisterpayload');

/**
 * Parses payload and returns instance of payload to work with
 * @param {number} payloadType
 * @param {Buffer} rawPayload
 * @return {SubTxRegisterPayload}
 */
function parsePayload(payloadType, rawPayload) {
  switch (payloadType) {
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_REGISTER:
      return SubTxRegisterPayload.parsePayload(rawPayload);
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
function serializePayloadToJson(payload) {
  return payload.toJSON();
}

module.exports = {
  parsePayload: parsePayload,
  serializePayloadToBuffer: serializePayloadToBuffer,
  serializePayloadToJson: serializePayloadToJson
};