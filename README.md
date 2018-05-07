Dashcore Library
================

[![NPM Package](https://img.shields.io/npm/v/@dashevo/dashcore-lib.svg?style=flat-square)](https://www.npmjs.org/package/@dashevo/dashcore-lib)
[![Build Status](https://img.shields.io/travis/dashevo/dashcore-lib.svg?branch=master&style=flat-square)](https://travis-ci.org/dashevo/dashcore-lib)
[![Coverage Status](https://img.shields.io/coveralls/dashevo/dashcore-lib.svg?style=flat-square)](https://coveralls.io/github/dashevo/dashcore-lib?branch=master)

A pure and powerful JavaScript Dash library.

## Principles

Dash is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature of the Dash network allows for highly resilient dash infrastructure, and the developer community needs reliable, open-source tools to implement dash apps and services.

## Get Started

```
npm install dashcore-lib
```

## Docs

* [PrivateKey](docs/privatekey.md)
* [PublicKey](docs/publickey.md)
* [Script](docs/script.md)
* [Transaction](docs/transaction.md)
* [Unspent Output](docs/upspentoutput.md)
* [URI](docs/uri.md)

## Exemples

* [Generate a random address](docs/examples.md#generate-a-random-address)
* [Generate a address from a SHA256 hash](docs/examples.md#generate-a-address-from-a-sha256-hash)
* [Import an address via WIF](docs/examples.md#import-an-address-via-wif)
* [Create a Transaction](docs/examples.md#create-a-transaction)
* [Sign a Dash message](docs/examples.md#sign-a-bitcoin-message)
* [Verify a Dash message](docs/examples.md#verify-a-bitcoin-message)
* [Create an OP RETURN transaction](docs/examples.md#create-an-op-return-transaction)
* [Create a 2-of-3 multisig P2SH address](docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
* [Spend from a 2-of-2 multisig P2SH address](docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)


## Security

We're using Bitcore in production, as are [many others](http://bitcore.io#projects), but please use common sense when doing anything related to finances! We take no responsibility for your implementation decisions.

If you find a security issue, please email security@bitpay.com.

## Contributing

Please send pull requests for bug fixes, code optimization, and ideas for improvement. For more information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/dashevo/dashcore-lib/blob/master/CONTRIBUTING.md) file.

## Building the Browser Bundle

To build a bitcore-lib-dash full bundle for the browser:

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
Copyright 2016-2018 The Dash Foundation, Inc.
