# UnspentOutput
`dashcore.Transaction.UnspentOutput` is a class with stateless instances that provides information about an unspent output:
- Transaction ID and output index
- The "scriptPubKey", the script included in the output
- Amount of satoshis associated
- Address, if available

## Parameters
The constructor is quite permissive with the input arguments. It can take outputs straight out of bitcoind's getunspent RPC call. Some of the names are not very informative for new users, so the UnspentOutput constructor also understands these aliases:
- `scriptPubKey`: just `script` is also accepted
- `amount`: expected value in BTC. If the `satoshis` alias is used, make sure to use satoshis instead of BTC.
- `vout`: this is the index of the output in the transaction, renamed to `outputIndex`
- `txid`: `txId`

## Example

```javascript
var utxo = new UnspentOutput({
  "txid" : "3912bd2b0c78706db809fff3ab51ac81ef20e0a53f61e4a2369cff0c4084c55c",
  "vout" : 0,
  "address" : "XuUGDZHrKLo841CyamDbG5W7n59epA71h2",
  "scriptPubKey" : "76a914fd1a0216dc01bc90b68b39bbe755de834be5dddd88ac",
  "amount" : 4.22900307
});
var utxo = new UnspentOutput({
  "txId" : "3912bd2b0c78706db809fff3ab51ac81ef20e0a53f61e4a2369cff0c4084c55c",
  "outputIndex" : 0,
  "address" : "XuUGDZHrKLo841CyamDbG5W7n59epA71h2",
  "script" : "76a914fd1a0216dc01bc90b68b39bbe755de834be5dddd88ac",
  "satoshis" : 422900307
});
```
