'use strict';

var buffer = require('buffer');

var chai = require('chai');
var should = chai.should();
var bitcore = require('../../');
var Script = bitcore.Script;
var Transaction = bitcore.Transaction;
var sighash = Transaction.sighash;
var BufferUtils = bitcore.util.buffer;
var Signature = bitcore.crypto.Signature;

var vectors_sighash = require('../data/sighash.json');

describe('sighash', function() {

  vectors_sighash.forEach(function(vector, i) {
    if (i === 0) {
      // First element is just a row describing the next ones
      return;
    }
    it('test vector from bitcoind #' + i + ' (' + vector[4].substring(0, 16) + ')', function() {
      var txbuf = new buffer.Buffer(vector[0], 'hex');
      var scriptbuf = new buffer.Buffer(vector[1], 'hex');
      var subscript = Script(scriptbuf);
      var nin = vector[2];
      var nhashtype = vector[3];
      var sighashbuf = new buffer.Buffer(vector[4], 'hex');
      var tx = new Transaction(txbuf);

      //make sure transacion to/from buffer is isomorphic
      tx.uncheckedSerialize().should.equal(vector[0]);

      //sighash ought to be correct
      BufferUtils.equal(sighash.sighash(tx, nhashtype, nin, subscript), sighashbuf).should.be.true;
    });
  });

  it('sighashPreimage handles correctly the SIGHASH_SINGLE bug', function() {

    // Use the first transaction from vectors_sighash as template
    var faketx = new Transaction(vectors_sighash[1][0]);

    // Clear all outputs
    faketx.outputs = [];
    var script = new Script();

    // Calculate preimage with the SIGHASH_SINGLE bug
    var preimage = sighash.sighashPreimage(faketx, Signature.SIGHASH_SINGLE, 0, script)

    var SIGHASH_SINGLE_BUG_RESULT = '0000000000000000000000000000000000000000000000000000000000000001';

    preimage.toString('hex').should.equal(SIGHASH_SINGLE_BUG_RESULT)
  });
});
