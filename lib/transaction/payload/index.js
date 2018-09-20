var Payload = require('./payload');

Payload.SubTxRegisterPayload = require('./subtxregisterpayload');
Payload.SubTxTransitionPayload = require('./subtxtransitionpayload');
Payload.CoinbasePayload = require('./coinbasepayload');
Payload.constants = require('./constants');

module.exports = Payload;