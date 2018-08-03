'use strict';
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var _ = require('lodash');
var $ = require('../util/preconditions');

/* @param {*} - A Buffer, JSON string, or Object representing a MerkleBlock
* @returns {MerkleBlock}
* @constructor
*/
function MnListDiff(arg) {

  if (!(this instanceof MnListDiff)) {
    return new MnListDiff(arg);
  }

  var info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = MerkleBlock._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = {
      baseBlockHash: arg.baseBlockHash,
      blockHash: arg.blockHash,
      totalTransactions: arg.totalTransactions,
      merkleHashes: arg.merkleHashes,
      merkleFlags: arg.merkleFlags,
      cbTx: arg.cbTx,
      deletedMNs: arg.deletedMNs,
      mnList: arg.mnList,
    }
  }
  else {
    throw new TypeError('Unrecognized argument for MerkleBlock');
  }
  _.extend(this, info);
  this._flagBitsUsed = 0;
  this._hashesUsed = 0;
  return this;
}

MnListDiff._fromBufferReader = function _fromBufferReader(br) {
  $.checkState(!br.finished(), 'No mndifflist data received');
  var info = {};
  info.baseBlockHash = br.read(32).toString('hex');
  info.blockHash = br.read(32).toString('hex');
  info.totalTransactions = br.readVarintNum();
  
  info.merkleHashes = []
  for (var i = 0; i < br.readVarintNum(); i++) {
    info.merkleHashes.push(br.read(32).toString('hex'));
  }

  info.merkleFlags = []
  for (var i = 0; i < br.readVarintNum(); i++) {
    info.merkleFlags.push(br.readUInt8());
  }

  info.cbTx = br.read();

  info.deletedMNs = []
  for (var i = 0; i < br.readVarintNum(); i++) {
    info.deletedMNs.push(br.read());
  }

  info.mnList = []
  for (var i = 0; i < br.readVarintNum(); i++) {
    info.mnList.push(br.read());
  }

  return info;
};

MnListDiff.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }

  bw.write(this.baseBlockHash);
  bw.write(this.blockHash);
  bw.writeVarintNum(this.totalTransactions);

  bw.writeVarintNum(this.merkleHashes.length);
  for (var i = 0; i < this.merkleHashes.length; i++) {
    bw.write(new Buffer(this.merkleHashes[i], 'hex'));
  }

  bw.writeVarintNum(this.merkleFlags.length);
  for (var i = 0; i < this.merkleFlags.length; i++) {
    bw.writeUInt8(this.merkleFlags[i]);
  }

  bw.write(this.cbTx);

  bw.writeVarintNum(this.deletedMNs.length);
  for (var i = 0; i < this.deletedMNs.length; i++) {
    bw.write(this.deletedMNs[i]);
  }

  bw.writeVarintNum(this.mnList.length);
  for (var i = 0; i < this.mnList.length; i++) {
    bw.write(this.mnList[i]);
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
