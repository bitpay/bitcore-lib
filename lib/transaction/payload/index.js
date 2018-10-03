var Payload = require('./payload');

Payload.ProRegTxPayload = require('./proregtxpayload')
Payload.SubTxRegisterPayload = require('./subtxregisterpayload');
Payload.SubTxTransitionPayload = require('./subtxtransitionpayload');
Payload.CoinbasePayload = require('./coinbasepayload');
Payload.constants = require('./constants');

module.exports = Payload;