const RegisteredPayloadTypes = require('./registeredtypes');
const SubTxRegisterPayload = require('./payload/subtxregisterpayload');

/**
 *
 * @param {number} payloadType
 * @param {Buffer} rawPayload
 */
function parsePayload(payloadType, rawPayload) {
  switch (payloadType) {
    case RegisteredPayloadTypes.TRANSACTION_SUBTX_REGISTER:
      return new SubTxRegisterPayload(rawPayload);
  }
}

function serializePayload() {

}

function payloadToJson() {

}

module.exports = {
  parsePayload: parsePayload,
  serializePayload: serializePayload,
};