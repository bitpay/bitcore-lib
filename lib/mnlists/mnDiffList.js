'use strict';
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');

function MnDiffList(arg) {

  if (!(this instanceof MnDiffList)) {
    return new MnDiffList(arg);
  }
}

MnDiffList._fromBufferReader = function _fromBufferReader(br) {
  var info = {msg : 'dashcore-lib mapping todo'};
  return info;
};

MnDiffList.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }

  return bw;
};


MnDiffList.fromObject = function fromObject(obj) {
  return new MnDiffList(obj);
};

MnDiffList.fromBufferReader = function fromBufferReader(br) {
  return new MnDiffList(MnDiffList._fromBufferReader(br));
};

MnDiffList.fromBuffer = function fromBuffer(buf) {
  return MnDiffList.fromBufferReader(BufferReader(buf));
};

MnDiffList.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

module.exports = MnDiffList;
