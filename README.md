DigiByte.JS
=======

[![NPM Package](https://img.shields.io/npm/v/bitcore-lib.svg?style=flat-square)](https://www.npmjs.org/package/bitcore-lib)
[![Build Status](https://img.shields.io/travis/digibyte/digibyte.js.svg?branch=master&style=flat-square)](https://travis-ci.org/digibyte/digibyte.js)
[![Coverage Status](https://img.shields.io/coveralls/digibyte/digibyte.js.svg?style=flat-square)](https://coveralls.io/r/digibyte/digibyte.js)

A pure and powerful JavaScript DigiByte library.

## Principles

DigiByte is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature of the DigiByte network allows for highly resilient digibyte infrastructure, and the developer community needs reliable, open-source tools to implement digibyte apps and services.

## Get Started

```
npm install digibyte
```

```
bower install digibyte
```

## Documentation

The complete docs are hosted here: [digibyte.js documentation](http://docs.digibyte.co).

## Examples

* [Generate a random address](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#generate-a-random-address)
* [Generate a address from a SHA256 hash](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#generate-a-address-from-a-sha256-hash)
* [Import an address via WIF](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#import-an-address-via-wif)
* [Create a Transaction](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#create-a-transaction)
* [Sign a DigiByte message](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#sign-a-bitcoin-message)
* [Verify a DigiByte message](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#verify-a-bitcoin-message)
* [Create an OP RETURN transaction](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#create-an-op-return-transaction)
* [Create a 2-of-3 multisig P2SH address](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
* [Spend from a 2-of-2 multisig P2SH address](https://github.com/digibyte/digibyte.js/blob/master/docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)


## Security

We're using DigiByte.JS in production, but please use common sense when doing anything related to finances! We take no responsibility for your implementation decisions.

If you find a security issue, please email dev@digibyte.co.

## Contributing

Please send pull requests for bug fixes, code optimization, and ideas for improvement. For more information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/digibyte/digibyte.js/blob/master/CONTRIBUTING.md) file.

## Building the Browser Bundle

To build a digibyte.js full bundle for the browser:

```sh
gulp browser
```

This will generate files named `digibyte.js` and `digibyte.min.js`.


## Development & Tests

```sh
git clone https://github.com/digibyte/digibyte.js
cd digibyte.js
npm install
```

Run all the tests:

```sh
gulp test
```

You can also run just the Node.js tests with `gulp test:node`, just the browser tests with `gulp test:browser`
or create a test coverage report (you can open `coverage/lcov-report/index.html` to visualize it) with `gulp coverage`.

## License

Code released under [the MIT license](https://github.com/digibyte/digibyte.js/blob/master/LICENSE).

Copyright 2017 Digibyte, Co.
