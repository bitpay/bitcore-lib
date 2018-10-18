var Payload = require('./payload');

Payload.ProRegTxPayload = require('./proregtxpayload')
Payload.SubTxRegisterPayload = require('./subtxregisterpayload');
Payload.SubTxResetKeyPayload = require('./subtxresetkeypayload');
Payload.SubTxTransitionPayload = require('./subtxtransitionpayload');
Payload.CoinbasePayload = require('./coinbasepayload');
Payload.ProTxUpServPayload = require('./proupservtxpayload');
Payload.constants = require('./constants');

module.exports = Payload;
