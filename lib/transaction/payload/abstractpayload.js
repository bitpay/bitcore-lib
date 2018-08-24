var Hash = require('../../crypto/hash');
var hashSignature = require('../../crypto/hashsignature');

function AbstractPayload() {

}

/**
 *
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {Buffer}
 */
AbstractPayload.prototype.toBuffer = function(options) {
  throw new Error('Not implemented');
};

/**
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {Object}
 */
AbstractPayload.prototype.toJSON = function(options) {
  throw new Error('Not implemented');
};

/**
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {string}
 */
AbstractPayload.prototype.toString = function(options) {
  return this.toBuffer().toString('hex');
};

/**
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
 * @return {Buffer} - hash
 */
AbstractPayload.prototype.getHash = function(options) {
  return Hash.sha256sha256(this.toBuffer(options));
};

/**
 * Signs payload
 * @param {string|PrivateKey} privateKey
 * @return {AbstractPayload}
 */
AbstractPayload.prototype.sign = function(privateKey) {
  var payloadHash = this.getHash({ skipSignature: true });
  var signatureBuffer = hashSignature.signHash(payloadHash, privateKey);
  this.vchSig = signatureBuffer.toString('hex');
  return this;
};

/**
 * Verify payload signature
 * @param {string|Buffer} publicKeyId
 * @return {boolean}
 */
AbstractPayload.prototype.verifySignature = function (publicKeyId) {
  var payloadHash = this.getHash({ skipSignature: true });
  var signatureBuffer = Buffer.from(this.vchSig, 'hex');
  return hashSignature.verifySignature(payloadHash, signatureBuffer, publicKeyId);
};

module.exports = AbstractPayload;
