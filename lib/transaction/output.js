'use strict';

var _ = require('lodash');
var BN = require('../crypto/bn');
var buffer = require('buffer');
var bufferUtil = require('../util/buffer');
var JSUtil = require('../util/js');
var BufferWriter = require('../encoding/bufferwriter');
var Script = require('../script');
var $ = require('../util/preconditions');
var errors = require('../errors');

var MAX_SAFE_INTEGER = 0x1fffffffffffff;

var OUTPUT_TYPES = {
    OUTPUT_NULL:0,
    OUTPUT_STANDARD:1,
    OUTPUT_CT:2,
    OUTPUT_RINGCT:3,
    OUTPUT_DATA:4,
}

function Output(args) {
  if (!(this instanceof Output)) {
    return new Output(args);
  }
  if (_.isObject(args)) {
    this.type = args.type;
    
    if (typeof args.satoshis != 'undefined')
      this.satoshis = args.satoshis;
    
    if (typeof args.script != 'undefined')
    {
      if (bufferUtil.isBuffer(args.script)) {
        this._scriptBuffer = args.script;
      } else {
        var script;
        if (_.isString(args.script) && JSUtil.isHexa(args.script)) {
          script = new buffer.Buffer(args.script, 'hex');
        } else {
          script = args.script;
        }
        this.setScript(script);
      }
    };
    
    if (typeof args.data != 'undefined')
      this.data = args.data;
    
    if (typeof args.pubkey != 'undefined')
      this.pubkey = args.pubkey;
    
    if (typeof args.valueCommitment != 'undefined')
      this.valueCommitment = args.valueCommitment;
    
    if (typeof args.rangeproof != 'undefined')
      this.rangeproof = args.rangeproof;
    
  } else {
    throw new TypeError('Unrecognized argument for Output');
  }
}

Object.defineProperty(Output.prototype, 'script', {
  configurable: false,
  enumerable: true,
  get: function() {
    if (this._script) {
      return this._script;
    } else {
      this.setScriptFromBuffer(this._scriptBuffer);
      return this._script;
    }

  }
});

Object.defineProperty(Output.prototype, 'satoshis', {
  configurable: false,
  enumerable: true,
  get: function() {
    return this._satoshis;
  },
  set: function(num) {
    if (num instanceof BN) {
      this._satoshisBN = num;
      this._satoshis = num.toNumber();
    } else if (_.isString(num)) {
      this._satoshis = parseInt(num);
      this._satoshisBN = BN.fromNumber(this._satoshis);
    } else {
      $.checkArgument(
        JSUtil.isNaturalNumber(num),
        'Output satoshis is not a natural number'
      );
      this._satoshisBN = BN.fromNumber(num);
      this._satoshis = num;
    }
    $.checkState(
      JSUtil.isNaturalNumber(this._satoshis),
      'Output satoshis is not a natural number'
    );
  }
});

Output.prototype.invalidSatoshis = function() {
  if (this._satoshis > MAX_SAFE_INTEGER) {
    return 'transaction txout satoshis greater than max safe integer';
  }
  if (this._satoshis !== this._satoshisBN.toNumber()) {
    return 'transaction txout satoshis has corrupted value';
  }
  if (this._satoshis < 0) {
    return 'transaction txout negative';
  }
  return false;
};

Output.prototype.toObject = Output.prototype.toJSON = function toObject() {
  var obj = {
    satoshis: this.satoshis
  };
  obj.script = this._scriptBuffer.toString('hex');
  if (this.data)
    obj.data = this.data;
  return obj;
};

Output.fromObject = function(data) {
  return new Output(data);
};

Output.prototype.setScriptFromBuffer = function(buffer) {
  this._scriptBuffer = buffer;
  try {
    this._script = Script.fromBuffer(this._scriptBuffer);
    this._script._isOutput = true;
  } catch(e) {
    if (e instanceof errors.Script.InvalidBuffer) {
      this._script = null;
    } else {
      throw e;
    }
  }
};

Output.prototype.setScript = function(script) {
  if (script instanceof Script) {
    this._scriptBuffer = script.toBuffer();
    this._script = script;
    this._script._isOutput = true;
  } else if (_.isString(script)) {
    this._script = Script.fromString(script);
    this._scriptBuffer = this._script.toBuffer();
    this._script._isOutput = true;
  } else if (bufferUtil.isBuffer(script)) {
    this.setScriptFromBuffer(script);
  } else {
    throw new TypeError('Invalid argument type: script');
  }
  return this;
};

Output.prototype.inspect = function() {
  var scriptStr;
  if (this.script) {
    scriptStr = this.script.inspect();
  } else {
    scriptStr = this._scriptBuffer.toString('hex');
  }
  return '<Output (' + this.satoshis + ' sats) ' + scriptStr + '>';
};

Output.fromBufferReader = function(br) {
  var obj = {};
  
  obj.type = br.readUInt8();
  obj.satoshis = 0;
  obj.script = new buffer.Buffer([]);
  
  switch(obj.type)
  {
    case OUTPUT_TYPES.OUTPUT_STANDARD:
      obj.satoshis = br.readUInt64LEBN();
      var size = br.readVarintNum();
      if (size !== 0) {
        obj.script = br.read(size);
      } else {
        obj.script = new buffer.Buffer([]);
      }
      break;
    case OUTPUT_TYPES.OUTPUT_CT:
      obj.valueCommitment = br.read(33);
      var size = br.readVarintNum();
      if (size !== 0) {
        obj.data = br.read(size);
      } else {
        obj.data = new buffer.Buffer([]);
      }
      size = br.readVarintNum();
      if (size !== 0) {
        obj.script = br.read(size);
      } else {
        obj.script = new buffer.Buffer([]);
      }
      size = br.readVarintNum();
      if (size !== 0) {
        obj.rangeproof = br.read(size);
      } else {
        obj.rangeproof = new buffer.Buffer([]);
      }
      break;
    case OUTPUT_TYPES.OUTPUT_RINGCT:
      obj.pubkey = br.read(33);
      obj.valueCommitment = br.read(33);
      var size = br.readVarintNum();
      if (size !== 0) {
        obj.data = br.read(size);
      } else {
        obj.data = new buffer.Buffer([]);
      }
      
      size = br.readVarintNum();
      if (size !== 0) {
        obj.rangeproof = br.read(size);
      } else {
        obj.rangeproof = new buffer.Buffer([]);
      }
      
      break;
    case OUTPUT_TYPES.OUTPUT_DATA:
      var size = br.readVarintNum();
      if (size !== 0) {
        obj.data = br.read(size);
      } else {
        obj.data = new buffer.Buffer([]);
      }
      break;
    default:
      break;
  };
  /*
  obj.satoshis = br.readUInt64LEBN();
  var size = br.readVarintNum();
  if (size !== 0) {
    obj.script = br.read(size);
  } else {
    obj.script = new buffer.Buffer([]);
  }
  */
  return new Output(obj);
};

Output.prototype.toBufferWriter = function(writer, noWitness, includeType) {
  if (!writer) {
    writer = new BufferWriter();
  }

  if (!_.isUndefined(includeType) // default value isn't working
    && includeType != true)
  {
  } else
  {
    writer.writeUInt8(this.type);
  }
  switch(this.type)
  {
    case OUTPUT_TYPES.OUTPUT_STANDARD:
      writer.writeUInt64LEBN(this._satoshisBN);
      var script = this._scriptBuffer;
      writer.writeVarintNum(script.length);
      writer.write(script);
      break;
    case OUTPUT_TYPES.OUTPUT_CT:
      writer.write(this.valueCommitment);
      writer.writeVarintNum(this.data.length);
      writer.write(this.data);
      
      var script = this._scriptBuffer;
      writer.writeVarintNum(script.length);
      writer.write(script);

      if (!_.isUndefined(noWitness) // default value isn't working
        && noWitness == true || _.isUndefined(this.rangeproof)) {

        writer.writeVarintNum(0);
      } else {
        writer.writeVarintNum(this.rangeproof.length);
        writer.write(this.rangeproof);
      }
      break;
    case OUTPUT_TYPES.OUTPUT_RINGCT:
      writer.write(this.pubkey);
      writer.write(this.valueCommitment);
      writer.writeVarintNum(this.data.length);
      writer.write(this.data);
      
      if (!_.isUndefined(noWitness) // default value isn't working
        && noWitness == true) {
        writer.writeVarintNum(0);
      } else {
        writer.writeVarintNum(this.rangeproof.length);
        writer.write(this.rangeproof);
      }
      break;
    case OUTPUT_TYPES.OUTPUT_DATA:
      if (typeof this.data != 'undefined') {
        writer.writeVarintNum(this.data.length);
        writer.write(this.data);
      } else {
        process.stdout.write("Error: data output missing data.\n");
      }
      break;
    default:
      break;
  }
  /*
  writer.writeUInt64LEBN(this._satoshisBN);
  var script = this._scriptBuffer;
  writer.writeVarintNum(script.length);
  writer.write(script);
  */
  return writer;
};

module.exports = Output;
