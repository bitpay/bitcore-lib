var Signature = require('./signature');
var MessageSigner = require('../message');
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
    var signer = new MessageSigner(hash.toString());
    return Buffer.from(signer.sign(privateKey), 'base64');
  },

  /**
   * Verifies hash signature against public key id
   * @param {Buffer} hash
   * @param {Buffer} dataSignature
   * @param {Buffer|string} publicKeyId
   * @return {boolean}
   */
  verifySignature: function(hash, dataSignature, publicKeyId) {
    var signer = new MessageSigner(hash.toString());
    var signature = Signature.fromCompact(dataSignature);
    var magicHash = signer.magicHash();
    var publicKey = new ECDSA({
      hashbuf: magicHash,
      sig: signature
    }).toPublicKey();
    if (!publicKey._getID().equals(new Buffer(publicKeyId, 'hex'))) {
      return false;
    }

    return ECDSA.verify(magicHash, signature, publicKey);
  }
};

module.exports = hashSignature;