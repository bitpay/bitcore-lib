'use strict';

var _ = require('lodash');
var $ = require('../util/preconditions');
var buffer = require('buffer');
var compare = Buffer.compare || require('buffer-compare');

var errors = require('../errors');
var BufferUtil = require('../util/buffer');
var JSUtil = require('../util/js');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');

var Address = require('../address');

/**
 * Represents a generic Governance Object
 *
 * @param serialized
 * @returns {*}
 * @constructor
 */
function GovObject(serialized) {
    if (serialized) {
        if (serialized instanceof GovObject) {
            return GovObject.shallowCopy(serialized);
        } else if (JSUtil.isHexa(serialized)) {
            return this.fromString(serialized);
        } else if (BufferUtil.isBuffer(serialized)) {
            return this.fromBuffer(serialized);
        } else if (_.isObject(serialized)) {
            return this.fromObject(serialized);
        } else {
            throw new errors.InvalidArgument('Must provide an object or string to deserialize a transaction');
        }
    } else {
        this._newGovObject();
    }
}

/**
 * dataHex will output GovObject 'data-hex' value, should be overridden by specific object type
 *
 */
GovObject.prototype.dataHex = function() {

    return null;
};

/**
 * GovObject instantiation method, should be overridden by specific GovObject type
 *
 * @private
 */
GovObject.prototype._newGovObject = function() {

    return null;
};

/**
 * GovObject instantation method from JSON object, should be overridden by specific GovObject type
 *
 * @param arg
 * @returns Casted GovObject
 */
GovObject.prototype.fromObject = function fromObject(arg) {
    var govObject;
    //Allow an arg to be a stringified json
    if (!(_.isObject(arg) || arg instanceof GovObject)) {
        try {
            var parsed = JSON.parse(arg);
        } catch (e) {
            throw new Error('Must be a valid stringified JSON');
        }
        return this.fromObject(parsed);
    }

    //Even if generic, we still expect to have a minimal number of properties
    var expectedProperties = [
        ['type', "number"]
    ];
    govObject = arg;
    _.each(expectedProperties, function(prop) {
        var expectedPropName = prop[0];
        var expectedPropType = prop[1];
        var existProp = govObject.hasOwnProperty(expectedPropName);
        if (!existProp) {
            throw new Error('Must be a valid JSON - Property ' + expectedPropName + ' missing');
        }
        var receivedType = typeof govObject[expectedPropName];
        if (receivedType !== expectedPropType) {
            var err_m = 'Must be a valid JSON - Expected property ' + expectedPropName + ' to be a ' + expectedPropType + ' received:' + receivedType
            throw new Error(err_m);
        }
    });

    switch (govObject.type) {
        case 1:
            var proposal = new GovObject.Proposal;
            proposal = proposal.fromObject(govObject);
            return proposal;
        default:
            throw new Error('Unhandled GovObject type');
    }
};

/**
 * GovObject instantiation method from hex string
 *
 * @param string
 */
GovObject.prototype.fromString = function(string) {
    return this.fromBuffer(new buffer.Buffer(string, 'hex'));
};

/**
 * Retrieve a hex string that can be used with dashd's CLI interface
 *
 * @param {Object} opts allows to skip certain tests. {@see Transaction#serialize}
 * @return {string}
 */
GovObject.prototype.checkedSerialize = function(opts) {
    var serializationError = this.getSerializationError(opts);
    if (serializationError) {
        throw serializationError;
    }
    return this.uncheckedSerialize();
};

GovObject.prototype.serialize = function(unsafe) {
    if (true === unsafe || unsafe && unsafe.disableAll) {
        return this.uncheckedSerialize();
    } else {
        return this.checkedSerialize(unsafe);
    }
};

GovObject.prototype.uncheckedSerialize = GovObject.prototype.toString = function() {
    return this.toBuffer().toString('hex');
};

GovObject.prototype.inspect = function() {
    return '<GovObject: ' + this.uncheckedSerialize() + '>';
};

GovObject.prototype.toBuffer = function() {
    var writer = new BufferWriter();
    return this.toBufferWriter(writer).toBuffer();
};

GovObject.prototype.toBufferWriter = function(writer) {
    writer.write(new Buffer(this.dataHex()));
    return writer;
};

GovObject.prototype.fromBuffer = function(buffer) {
    var reader = new BufferReader(buffer);
    return this.fromBufferReader(reader);
};

GovObject.prototype.fromBufferReader = function(reader) {
    $.checkArgument(!reader.finished(), 'No data received');

    var dataHex = reader.read(reader.buf.length);

    var object = JSON.parse(dataHex.toString('utf8'));
    var jsonObject = object[0][1];// attempt to parse as JSON Object
    return this.fromObject(jsonObject);
};

GovObject.prototype._verifyDateFormat = function(date) {
    var parsedDate = new Date(date * 1000);
    return parsedDate;
};

GovObject.prototype._verifyPayment = function(payment) {
    var parsedPayment = parseFloat(payment);
    if (isNaN(parsedPayment)) return true;
    return Boolean((parsedPayment <= 0));
};

GovObject.prototype._verifyAddress = function(address, network) {
    return Address.isValid(address, network);
};

GovObject.prototype._verifyPayToScriptHash = function(address, network) {
    return new Address(address, network).isPayToScriptHash();
};

GovObject.prototype._verifyUrl = function(url) {
    var urlregex = /^(http|https):\/\/[^ "]{1,255}$/;
    return urlregex.test(url);
};

GovObject.prototype._verifyName = function(name) {
    var nameregex = /^[-_a-zA-Z0-9]{1,40}$/;
    return nameregex.test(name);
};

GovObject.shallowCopy = function(govObject) {
    var copy = new GovObject(govObject.toBuffer());
    return copy;
};


module.exports = GovObject;
