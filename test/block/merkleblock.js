'use strict';

var should = require('chai').should();

var bitcore = require('../..');
var MerkleBlock = bitcore.MerkleBlock;
var BufferReader = bitcore.encoding.BufferReader;
var BufferWriter = bitcore.encoding.BufferWriter;
var Transaction = bitcore.Transaction;
var data = require('../data/merkleblocks.js');
var transactionVector = require('../data/tx_creation');


describe('MerkleBlock', function() {
  var blockhex  = data.HEX[0];
  var blockbuf  = new Buffer(blockhex,'hex');
  var blockJSON = JSON.stringify(data.JSON[0]);
  var blockObject = JSON.parse(JSON.stringify(data.JSON[0]));

  describe('#constructor', function() {
    it('should make a new merkleblock from buffer', function() {
      var b = MerkleBlock(blockbuf);
      b.toBuffer().toString('hex').should.equal(blockhex);
    });

    it('should make a new merkleblock from object', function() {
      var b = MerkleBlock(blockObject);
      b.toObject().should.deep.equal(blockObject);
    });

    it('should make a new merkleblock from JSON', function() {
      var b = MerkleBlock(JSON.parse(blockJSON));
      JSON.stringify(b).should.equal(blockJSON);
    });

    it('should not make an empty block', function() {
      (function() {
        return new MerkleBlock();
      }).should.throw('Unrecognized argument for MerkleBlock');
    });
  });

  describe('#fromObject', function() {

    it('should set these known values', function() {
      var block = MerkleBlock.fromObject(JSON.parse(blockJSON));
      should.exist(block.header);
      should.exist(block.numTransactions);
      should.exist(block.hashes);
      should.exist(block.flags);
    });

    it('should set these known values', function() {
      var block = MerkleBlock(JSON.parse(blockJSON));
      should.exist(block.header);
      should.exist(block.numTransactions);
      should.exist(block.hashes);
      should.exist(block.flags);
    });

    it('accepts an object as argument', function() {
      var block = MerkleBlock(blockbuf);
      MerkleBlock.fromObject(block.toObject()).should.exist;
    });

  });

  describe('#toJSON', function() {

    it('should recover these known values', function() {
      var block = new MerkleBlock(JSON.parse(blockJSON));
      var b = JSON.parse(JSON.stringify(block));
      should.exist(block.header);
      should.exist(block.numTransactions);
      should.exist(block.hashes);
      should.exist(block.flags);
      should.exist(b.header);
      should.exist(b.numTransactions);
      should.exist(b.hashes);
      should.exist(b.flags);
    });

  });

  describe('#fromBuffer', function() {

    it('should make a block from this known buffer', function() {
      var block = MerkleBlock.fromBuffer(blockbuf);
      block.toBuffer().toString('hex').should.equal(blockhex);
    });

  });

  describe('#fromBufferReader', function() {

    it('should make a block from this known buffer', function() {
      var block = MerkleBlock.fromBufferReader(BufferReader(blockbuf));
      block.toBuffer().toString('hex').should.equal(blockhex);
    });

  });

  describe('#toBuffer', function() {

    it('should recover a block from this known buffer', function() {
      var block = MerkleBlock.fromBuffer(blockbuf);
      block.toBuffer().toString('hex').should.equal(blockhex);
    });

  });

  describe('#toBufferWriter', function() {

    it('should recover a block from this known buffer', function() {
      var block = MerkleBlock.fromBuffer(blockbuf);
      block.toBufferWriter().concat().toString('hex').should.equal(blockhex);
    });

    it('doesn\'t create a bufferWriter if one provided', function() {
      var writer = new BufferWriter();
      var block = MerkleBlock.fromBuffer(blockbuf);
      block.toBufferWriter(writer).should.equal(writer);
    });

  });


  describe('#validMerkleTree', function() {

    it('should validate good merkleblocks', function() {
      data.JSON.forEach(function(data) {
        var b = MerkleBlock(data);
        b.validMerkleTree().should.equal(true);
      });
    });

    it('should not validate merkleblocks with too many hashes', function() {
      var b = MerkleBlock(data.JSON[0]);
      // Add too many hashes
      var i = 0;
      while(i <= b.numTransactions) {
        b.hashes.push('bad' + i++);
      }
      b.validMerkleTree().should.equal(false);
    });

    it('should not validate merkleblocks with too few bit flags', function() {
      var b = MerkleBlock(JSON.parse(blockJSON));
      b.flags.pop();
      b.validMerkleTree().should.equal(false);
    });

  });

  describe('#hasTransaction', function() {

    it('should find transactions via hash string', function() {
      var jsonData = data.JSON[1];
      var txId = new Buffer(jsonData.hashes[2],'hex').toString('hex');
      var b = MerkleBlock(jsonData);
      b.hasTransaction(txId).should.equal(true);
      b.hasTransaction(txId + 'abcd').should.equal(false);
    });

    it('should find transactions via Transaction object', function() {
      var jsonData = data.JSON[1];
      var txBuf = new Buffer(data.TXHEX[0][1],'hex');
      var tx = new Transaction().fromBuffer(txBuf);
      var b = MerkleBlock(jsonData);
      b.hasTransaction(tx).should.equal(true);
    });

    it('should not find non-existant Transaction object', function() {
      // Reuse another transaction already in data/ dir
      var serialized = transactionVector[0][7];
      var tx = new Transaction().fromBuffer(new Buffer(serialized, 'hex'));
      var b = MerkleBlock(data.JSON[0]);
      b.hasTransaction(tx).should.equal(false);
    });

    it('should not match with merkle nodes', function() {
      var b = MerkleBlock(data.JSON[1]);

      var hashData = [
        ['9d0a368bc9923c6cb966135a4ceda30cc5f259f72c8843ce015056375f8a06ec', false],
        ['39e5cd533567ac0a8602bcc4c29e2f01a4abb0fe68ffbc7be6c393db188b72e0', false],
        ['cd75b421157eca03eff664bdc165730f91ef2fa52df19ff415ab5acb30045425', true],
        ['2ef9795147caaeecee5bc2520704bb372cde06dbd2e871750f31336fd3f02be3', true],
        ['2241d3448560f8b1d3a07ea5c31e79eb595632984a20f50944809a61fdd9fe0b', true],
        ['45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5', true],
        ['198c03da0ccf871db91fe436e2795908eac5cc7d164232182e9445f7f9db1ab2', false],
        ['ed07c181ce5ba7cb66d205bc970f43e1ca11996d611aa8e91e305eb8608c543c', false]
      ];

      hashData.forEach(function check(d){
        b.hasTransaction(d[0]).should.equal(d[1]);
      });

    });

  });

});

