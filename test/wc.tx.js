const litecore = require('bitcore-lib');
const networks = litecore.Networks;

networks.add({
    name: 'wclivenet',
    alias: 'wcmainnet',
    pubkeyhash: 0x4E,
    privatekey: 0xCE,
    scripthash: 0x57,
    port: 9333,
    dnsSeeds: [
        'bitcoin.sipa.be',
        'seed.bitcoin.sipa.be',
        'bluematt.me',
        'dnsseed.bluematt.me',
        'dashjr.org',
        'dnsseed.bitcoin.dashjr.org',
        'bitcoinstats.com',
        'seed.bitcoinstats.com',
        'xf2.org',
        'bitseed.xf2.org',
        'bitcoin.jonasschnelli.ch',
        'seed.bitcoin.jonasschnelli.ch'
    ]
});
var network = networks.get('wclivenet');
networks.defaultNetwork = network

var privateKey = new litecore.PrivateKey('xxxxxxxxxxxxxx', network);
console.log('钱包私钥：' + privateKey.toWIF())
console.log('钱包地址：' + privateKey.toAddress())
console.log('公钥地址：' + privateKey.toPublicKey())
var utxo = {
    "txId": "e5d161318861d9d875502bea00bdd202637a9af3224959dc9457397086954880",
    "outputIndex": 1,
    "address": "YSZpVE8pofY7ynVHkW1CziBXgtWoXC8uqL",
    "script": "76a9142322412535977896f161c1fe285742ff0807652c88ac",
    "satoshis": 18885000
};
var transaction = new litecore.Transaction()
    .from(utxo)
    .to('YZGQoPGsbYNw5ZV153itZ1WMjCLnpPow3C', 18885000 - 1e4)
    // .change(privateKey.toAddress())
    .sign(privateKey.toWIF());
var tx_hex = transaction.serialize();
console.log('transaction2==', tx_hex)