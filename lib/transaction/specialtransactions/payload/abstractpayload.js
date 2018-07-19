/**
 * @class AbstractPayload
 * @constructor
 */
function AbstractPayload() {

}

AbstractPayload.prototype.toBuffer = function toBuffer() {
  throw new Error('Not implemented');
};

AbstractPayload.prototype.toJSON = function toJSON() {
  throw new Error('Not implemented');
};

module.exports = AbstractPayload;