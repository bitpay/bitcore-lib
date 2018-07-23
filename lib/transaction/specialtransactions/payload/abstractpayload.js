var Hash = require('../../../crypto/hash');
var hashSignature = require('../../../crypto/hashsignature');

function AbstractSignature() {

}

/**
 *
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {Buffer}
 */
AbstractSignature.prototype.toBuffer = function(options) {
  throw new Error('Not implemented');
};

/**
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {Object}
 */
AbstractSignature.prototype.toJSON = function(options) {
  throw new Error('Not implemented');
};

/**
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {string}
 */
AbstractSignature.prototype.toString = function(options) {
  return this.toBuffer().toString('hex');
};

/**
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {Buffer} - hash
 */
AbstractSignature.prototype.getHash = function(options) {
  return Hash.sha256sha256(this.toBuffer(options));
};

/**
 * Signs payload
 * @param {string|PrivateKey} privateKey
 * @return {AbstractSignature}
 */
AbstractSignature.prototype.sign = function(privateKey) {
  var payloadHash = this.getHash({ skipSignature: true });
  this.vchSig = hashSignature.signHash(payloadHash, privateKey);
  return this;
};

/**
 * Verify payload signature
 * @param {string|Buffer} publicKeyId
 * @return {boolean}
 */
AbstractSignature.prototype.verifySignature = function (publicKeyId) {
  var payloadHash = this.getHash({ skipSignature: true });
  return hashSignature.verifySignature(payloadHash, this.vchSig, publicKeyId);
};

module.exports = AbstractSignature;
