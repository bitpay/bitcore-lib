'use strict';

var _ = require('lodash');
var $ = require('../../util/preconditions');
var GovObject = require('../govobject');
var errors = require('../../errors');
var inherits = require('util').inherits;

/**
 * Represents 'proposal' Governance Object
 *
 * @constructor
 */
function Proposal(serialized) {
    GovObject.call(this, serialized);
}

inherits(Proposal, GovObject);

Proposal.prototype.dataHex = function() {
    var _govObj = {
        end_epoch: this.end_epoch,
        name: this.name,
        payment_address: this.payment_address,
        payment_amount: this.payment_amount,
        start_epoch: this.start_epoch,
        type: this.type,
        url: this.url
    };

    // screwy data shims 'til we can fix this on dashd
    var inner = ['proposal', _govObj];
    var outer = [inner];

    return JSON.stringify(outer);
};

Proposal.prototype._newGovObject = function() {
    this.end_epoch = "";
    this.name = "";
    this.payment_address = "";
    this.payment_amount = "";
    this.start_epoch = "";
    this.type = "";
    this.url = "";
};

Proposal.prototype.fromObject = function fromObject(arg) {
    //Allow an arg to be a stringified json
    if (!(_.isObject(arg) || arg instanceof GovObject)) {
        try {
            var parsed = JSON.parse(arg);
        } catch (e) {
            throw new Error('Must be a valid stringified JSON');
        }
        return this.fromObject(parsed);
    }

    var expectedProperties = [
        ["end_epoch", "number"],
        ['name', 'string'],
        ["payment_address", "string"],
        ['payment_amount', "number"],
        ["start_epoch", "number"],
        ['type', "number"],
        ['url', 'string']
    ];
    var proposal = arg;
    var self = this;

    _.each(expectedProperties, function(prop) {
        var expectedPropName = prop[0];
        var expectedPropType = prop[1];
        var existProp = proposal.hasOwnProperty(expectedPropName);
        if (!existProp) {
            throw new Error('Must be a valid JSON - Property ' + expectedPropName + ' missing');
        }
        var receivedType = typeof proposal[expectedPropName];
        if (receivedType !== expectedPropType) {
            var err_m = 'Must be a valid JSON - Expected property ' + expectedPropName + ' to be a ' + expectedPropType + ' received:' + receivedType
            throw new Error(err_m);
        }
        var receivedValue = proposal[expectedPropName];
        if (receivedType === "number" && isNaN(receivedValue)) {
            throw new Error('Must be a valid JSON - Expected property ' + expectedPropName + ' to be a number');
        }
        self[expectedPropName] = proposal[expectedPropName];
    });

    if (proposal.type && proposal.type !== 1) {
        //Not a proposal type, we tell about it
        throw new Error("Must be a valid proposal type.");
    }
    return this;
};

Proposal.prototype.fromBufferReader = function(reader) {
  $.checkArgument(!reader.finished(), 'No data received');

  var dataHex = reader.read(reader.buf.length);
  var object = JSON.parse(dataHex.toString('utf8'));

  if(object.constructor.name === 'Array'){
    this.type = object[0][0];
    this.end_epoch = object[0][1].end_epoch;
    this.name = object[0][1].name;
    this.payment_address = object[0][1].payment_address;
    this.payment_amount = object[0][1].payment_amount;
    this.start_epoch = object[0][1].start_epoch;
    this.type = object[0][1].type;
    this.url = object[0][1].url;
  }
  else if(object.constructor.name==='Object') _.merge(this, object)
  else throw new Error('Invalid proposal')

  return this;

};

Proposal.prototype.getSerializationError = function(opts) {
    opts = opts || {};

    // verify date format is a number
    if (isNaN(this._verifyDateFormat(this.start_epoch))) {
        return new errors.GovObject.Proposal.invalidDate();
    }

    // verify date format is a number
    if (isNaN(this._verifyDateFormat(this.end_epoch))) {
        return new errors.GovObject.Proposal.invalidDate();
    }

    // verify that start_epoch is greater than or equal to end_epoch
    if (this.start_epoch >= this.end_epoch) {
        return new errors.GovObject.Proposal.invalidDateWindow();
    }

    // verify that end_epoch is later than now
    var now = Math.round(new Date().getTime() / 1000);
    if (this.end_epoch < now) {
        return new errors.GovObject.Proposal.invalidDateWindow();
    }

    // verify address
    if (!this._verifyAddress(this.payment_address, this.network)) {
        return new errors.GovObject.Proposal.invalidAddress();
    }

    // verify not P2SH
    if (this._verifyPayToScriptHash(this.payment_address, this.network)) {
        return new errors.GovObject.Proposal.invalidP2SHAddress();
    }

    // verify payment amount (should be non-negative number)
    if (this._verifyPayment(this.payment_amount)) {
        return new errors.GovObject.Proposal.invalidPayment();
    }

    // verify url contains http/https and is less than or equal to 255 characters in length
    if (!this._verifyUrl(this.url)) {
        return new errors.GovObject.Proposal.invalidUrl();
    }

    // verify name is alphanumeric and less than or equal to 40 characters in length
    if (!this._verifyName(this.name)) {
        return new errors.GovObject.Proposal.invalidName();
    }

};


module.exports = Proposal;
