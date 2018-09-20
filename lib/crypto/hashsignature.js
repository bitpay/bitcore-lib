var Signature = require('./signature');
var ECDSA = require('./ecdsa');
var PrivateKey = require('../privatekey');

var hashSignature = {
  /**
   * Sign hash.
   * @param {Buffer} hash
   * @param {string|PrivateKey} privateKey
   * @return {Buffer} - 65-bit compact signature
   */
  signHash: function(hash, privateKey) {
    if (typeof privateKey === 'string') {
      privateKey = new PrivateKey(privateKey);
    }
    var ecdsa = new ECDSA();
    ecdsa.hashbuf = hash;
    ecdsa.privkey = privateKey;
    ecdsa.pubkey = privateKey.toPublicKey();
    ecdsa.signRandomK();
    ecdsa.calci();
    return ecdsa.sig.toCompact();
  },

  /**
   * Verifies hash signature against public key id
   * @param {Buffer} hash
   * @param {Buffer} dataSignature
   * @param {Buffer|string} publicKeyId
   * @return {boolean}
   */
  verifySignature: function(hash, dataSignature, publicKeyId) {
    var signature = Signature.fromCompact(dataSignature);
    var extractedPublicKey = new ECDSA({
      hashbuf: hash,
      sig: signature
    }).toPublicKey();
    var extractedPubKeyId = extractedPublicKey._getID();
    var pubKeyId = new Buffer(publicKeyId, 'hex');

    return extractedPubKeyId.equals(pubKeyId);
  }
};

module.exports = hashSignature;