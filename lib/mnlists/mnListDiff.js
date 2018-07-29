'use strict';
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');

function MnListDiff(arg) {

  if (!(this instanceof MnListDiff)) {
    return new MnListDiff(arg);
  }
}

MnListDiff._fromBufferReader = function _fromBufferReader(br) {
  var info = {msg : 'dashcore-lib mapping todo'};
  return info;
};

MnListDiff.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }

  return bw;
};


MnListDiff.fromObject = function fromObject(obj) {
  return new MnListDiff(obj);
};

MnListDiff.fromBufferReader = function fromBufferReader(br) {
  return new MnListDiff(MnListDiff._fromBufferReader(br));
};

MnListDiff.fromBuffer = function fromBuffer(buf) {
  return MnListDiff.fromBufferReader(BufferReader(buf));
};

MnListDiff.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

module.exports = MnListDiff;
