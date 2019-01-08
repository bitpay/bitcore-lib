'use strict';
var _ = require('lodash');

var BufferUtil = require('./util/buffer');
var JSUtil = require('./util/js');
var networks = [];
var networkMaps = {};

/**
 * A network is merely a map containing values that correspond to version
 * numbers for each bitcoin network. Currently only supporting "livenet"
 * (a.k.a. "mainnet") and "testnet".
 * @constructor
 */
function Network() {}

Network.prototype.toString = function toString() {
  return this.name;
};

/**
 * @function
 * @member Networks#get
 * Retrieves the network associated with a magic number or string.
 * @param {string|number|Network} arg
 * @param {string|Array} keys - if set, only check if the magic number associated with this name matches
 * @return Network
 */
function get(arg, keys) {
  if (~networks.indexOf(arg)) {
    return arg;
  }
  if (keys) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    var containsArg = function(key) {
      return networks[index][key] === arg;
    };
    for (var index in networks) {
      if (_.some(keys, containsArg)) {
        return networks[index];
      }
    }
    return undefined;
  }
  return networkMaps[arg];
}

/**
 * @function
 * @member Networks#add
 * Will add a custom Network
 * @param {Object} data
 * @param {string} data.name - The name of the network
 * @param {string} data.alias - The aliased name of the network
 * @param {Number} data.pubkeyhash - The publickey hash prefix
 * @param {Number} data.privatekey - The privatekey prefix
 * @param {Number} data.scripthash - The scripthash prefix
 * @param {Number} data.xpubkey - The extended public key magic
 * @param {Number} data.xprivkey - The extended private key magic
 * @param {Number} data.networkMagic - The network magic number
 * @param {Number} data.port - The network port
 * @param {Array}  data.dnsSeeds - An array of dns seeds
 * @param {Number} data.pubkeyhash256 - The pubkeyhash256 hash prefix
 * @param {Number} data.scripthash256 - The scripthash256 prefix
 * @return Network
 */
function addNetwork(data) {

  var network = new Network();

  JSUtil.defineImmutable(network, {
    name: data.name,
    alias: data.alias,
    pubkeyhash: data.pubkeyhash,
    privatekey: data.privatekey,
    scripthash: data.scripthash,
    xpubkey: data.xpubkey,
    xprivkey: data.xprivkey,
    pubkeyhash256: data.pubkeyhash256,
    scripthash256: data.scripthash256,
  });

  if (data.networkMagic) {
    JSUtil.defineImmutable(network, {
      networkMagic: BufferUtil.integerAsBuffer(data.networkMagic)
    });
  }

  if (data.port) {
    JSUtil.defineImmutable(network, {
      port: data.port
    });
  }

  if (data.dnsSeeds) {
    JSUtil.defineImmutable(network, {
      dnsSeeds: data.dnsSeeds
    });
  }
  _.each(network, function(value) {
    if (!_.isUndefined(value) && !_.isObject(value)) {
      networkMaps[value] = network;
    }
  });

  networks.push(network);

  return network;

}

/**
 * @function
 * @member Networks#remove
 * Will remove a custom network
 * @param {Network} network
 */
function removeNetwork(network) {
  for (var i = 0; i < networks.length; i++) {
    if (networks[i] === network) {
      networks.splice(i, 1);
    }
  }
  for (var key in networkMaps) {
    if (networkMaps[key] === network) {
      delete networkMaps[key];
    }
  }
}

addNetwork({
  name: 'livenet',
  alias: 'mainnet',
  pubkeyhash: 0x38,
  privatekey: 0x6c,
  scripthash: 0x3c,
  xpubkey: 0x696e82d1,
  xprivkey: 0x8f1daeb8,
  networkMagic: 0xfbf2efb4,
  port: 51738,
  pubkeyhash256: 0x39,
  scripthash256: 0x3d,
  dnsSeeds: [
    'mainnet.particl.io'
  ]
});

/**
 * @instance
 * @member Networks#livenet
 */
var livenet = get('livenet');

addNetwork({
  name: 'testnet',
  alias: 'regtest',
  pubkeyhash: 0x76,
  privatekey: 0x2e,
  scripthash: 0x7a,
  xpubkey: 0xe1427800,
  xprivkey: 0x04889478,
  pubkeyhash256: 0x77,
  scripthash256: 0x7b,
});

/**
 * @instance
 * @member Networks#testnet
 */
var testnet = get('testnet');

// Add configurable values for testnet/regtest

var TESTNET = {
  PORT: 51938,
  NETWORK_MAGIC: BufferUtil.integerAsBuffer(0x0811050b),
  DNS_SEEDS: [
    'testnet.particl.io'
  ]
};

for (var key in TESTNET) {
  if (!_.isObject(TESTNET[key])) {
    networkMaps[TESTNET[key]] = testnet;
  }
}

var REGTEST = {
  PORT: 11938,
  NETWORK_MAGIC: BufferUtil.integerAsBuffer(0x0912060c),
  DNS_SEEDS: []
};

for (var key in REGTEST) {
  if (!_.isObject(REGTEST[key])) {
    networkMaps[REGTEST[key]] = testnet;
  }
}

Object.defineProperty(testnet, 'port', {
  enumerable: true,
  configurable: false,
  get: function() {
    if (this.regtestEnabled) {
      return REGTEST.PORT;
    } else {
      return TESTNET.PORT;
    }
  }
});

Object.defineProperty(testnet, 'networkMagic', {
  enumerable: true,
  configurable: false,
  get: function() {
    if (this.regtestEnabled) {
      return REGTEST.NETWORK_MAGIC;
    } else {
      return TESTNET.NETWORK_MAGIC;
    }
  }
});

Object.defineProperty(testnet, 'dnsSeeds', {
  enumerable: true,
  configurable: false,
  get: function() {
    if (this.regtestEnabled) {
      return REGTEST.DNS_SEEDS;
    } else {
      return TESTNET.DNS_SEEDS;
    }
  }
});

/**
 * @function
 * @member Networks#enableRegtest
 * Will enable regtest features for testnet
 */
function enableRegtest() {
  testnet.regtestEnabled = true;
}

/**
 * @function
 * @member Networks#disableRegtest
 * Will disable regtest features for testnet
 */
function disableRegtest() {
  testnet.regtestEnabled = false;
}

/**
 * @namespace Networks
 */
module.exports = {
  add: addNetwork,
  remove: removeNetwork,
  defaultNetwork: livenet,
  livenet: livenet,
  mainnet: livenet,
  testnet: testnet,
  get: get,
  enableRegtest: enableRegtest,
  disableRegtest: disableRegtest
};
