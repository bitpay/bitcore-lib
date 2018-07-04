Dashcore Library
================

[![NPM Package](https://img.shields.io/npm/v/@dashevo/dashcore-lib.svg?style=flat-square)](https://www.npmjs.org/package/@dashevo/dashcore-lib)
[![Build Status](https://img.shields.io/travis/dashevo/dashcore-lib.svg?branch=master&style=flat-square)](https://travis-ci.org/dashevo/dashcore-lib)
[![Coverage Status](https://img.shields.io/coveralls/dashevo/dashcore-lib.svg?style=flat-square)](https://coveralls.io/github/dashevo/dashcore-lib?branch=master)

A pure and powerful JavaScript Dash library.

## Principles

Dash is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature of the Dash network allows for highly resilient Dash infrastructure, and the developer community needs reliable, open-source tools to implement Dash apps and services.

## Get Started
### NodeJS
```
npm install @dashevo/dashcore-lib
```

### Browser

See the section below to generate your own bundle, or download the pre-generated [minified file](dist/dashcore-lib.min.js)


## Docs

* [Addresses](docs/address.md)
* [Block](docs/block.md)
* [Crypto](docs/crypto.md)
* [Encoding](docs/encoding.md)
* [Hierarchically-derived Private and Public Keys](docs/hierarchical.md)
* [Networks](docs/networks.md)
* [PrivateKey](docs/privatekey.md)
* [PublicKey](docs/publickey.md)
* [Script](docs/script.md)
* [Transaction](docs/transaction.md)
* [Using Different Units](docs/unit.md)
* [Unspent Output](docs/unspentoutput.md)
* [URI](docs/uri.md)
* [Governance Object / Proposal](docs/govobject/govobject.md)

## Examples

Some examples can be found [here](docs/examples.md), below is a list of direct links for some of them.


* [Generate a random address](docs/examples.md#generate-a-random-address)
* [Generate an address from a SHA256 hash](docs/examples.md#generate-a-address-from-a-sha256-hash)
* [Import an address via WIF](docs/examples.md#import-an-address-via-wif)
* [Create a Transaction](docs/examples.md#create-a-transaction)
* [Sign a Dash message](docs/examples.md#sign-a-bitcoin-message)
* [Verify a Dash message](docs/examples.md#verify-a-bitcoin-message)
* [Create an OP RETURN transaction](docs/examples.md#create-an-op-return-transaction)
* [Create a 2-of-3 multisig P2SH address](docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
* [Spend from a 2-of-2 multisig P2SH address](docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)

## Modules

Some functionality is implemented as a module that can be installed separately:

* [Payment Protocol Support](https://github.com/dashevo/dashcore-payment-protocol)
* [Peer to Peer Networking](https://github.com/dashevo/dashcore-p2p)
* [Dash Core JSON-RPC](https://github.com/dashevo/dashd-rpc)
* [Payment Channels](https://github.com/dashevo/dashcore-channel)
* [Mnemonics](https://github.com/dashevo/dashcore-mnemonic)
* [Elliptical Curve Integrated Encryption Scheme](https://github.com/dashevo/bitcore-ecies-dash)
* [Signed Messages](https://github.com/dashevo/bitcore-message-dash)

## Contributing

Please send pull requests for bug fixes, code optimization, and ideas for improvement. For more information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/dashevo/dashcore-lib/blob/master/CONTRIBUTING.md) file.

## Building the Browser Bundle

To build a dashcore-lib full bundle for the browser:

```sh
npm run build
```

This will generate files named `dashcore-lib.js` and `dashcore-lib.min.js` in the `dist/` folder.

## Usage on Browser

```
<script src='./dist/dashcore-lib.min.js' type="text/javascript"></script>
<script>
  const PrivateKey = dashcore.PrivateKey;
  const privateKey = new PrivateKey();
  const address = privateKey.toAddress().toString();
</script>
```

## Development & Tests

```sh
git clone https://github.com/dashevo/dashcore-lib
cd dashcore-lib
npm install
```

Run all the tests:

```sh
npm test
```

You can also run just the Node.js tests with `npm run test:node`, just the browser tests with `npm run test:browser`
or run a test coverage report with `npm run coverage`.

## License

Code released under [the MIT license](LICENSE).

Copyright 2013-2017 BitPay, Inc. Bitcore is a trademark maintained by BitPay, Inc.  
Copyright 2016-2017 The Dash Foundation, Inc.  
Copyright 2017-2018 Dash Core Group, Inc.  
