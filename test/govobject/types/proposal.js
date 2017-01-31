'use strict';

/* jshint unused: false */
/* jshint latedef: false */
var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('lodash');
var sinon = require('sinon');

var bitcore = require('../../..');
var BufferReader = bitcore.encoding.BufferReader;
var BufferWriter = bitcore.encoding.BufferWriter;

var Proposal = bitcore.GovObject.Proposal;
var errors = bitcore.errors;

// TODO: create Proposal from object

describe('Proposal', function() {
    var startDate = Math.round(new Date("2015-10-10").getTime()/1000);
    var endDate = Math.round(new Date("2025-10-10").getTime()/1000);
    var validJSONProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:startDate,
        end_epoch:endDate,
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
    it('should create new proposal', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = endDate;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = startDate;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        proposal.serialize().should.equal(expectedHex);
    });

    it('should throw error if invalid date', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = 1477872000;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = 'not a date'; // invalid date
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.start_epoch);

    });
    it('should throw error if end_epoch is invalid date', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = 'not a date';
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = 1477872000;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";
        var expectedErr =new errors.GovObject.Proposal.invalidDate();
        expect(proposal.getSerializationError().message).to.be.equal(expectedErr.message);

    });

    it('should throw error if start date >= end date', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = 1472688000;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = 1477872000;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.invalidDateWindow);

    });

    it('should throw error if end date < now', function() {
        var start_epoch = Math.round(new Date('1/18/2014').getTime()/1000);
        var end_epoch = Math.round(new Date('3/25/2015').getTime()/1000);

        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = end_epoch;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = start_epoch;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.invalidDateWindow);

    });

    it('should throw error if payment address is invalid', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = endDate;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'XmPtF6UoguyK'; // payment address must be > 26 characters
        proposal.payment_amount = 10;
        proposal.start_epoch = startDate;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.invalidAddress);

    });

    it('should throw error if amount <= 0', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = endDate;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = '';
        proposal.start_epoch = startDate;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.invalidPayment);

    });

    it('should throw error if invalid url', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = endDate;
        proposal.name = 'TestProposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = startDate;
        proposal.type = 1;
        proposal.url = "http";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.invalidUrl);

    });

    it('should throw error if proposal name is invalid', function() {
        var proposal = new Proposal();

        proposal.network = 'testnet';
        proposal.end_epoch = endDate;
        proposal.name = 'Test Proposal';
        proposal.payment_address = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
        proposal.payment_amount = 10;
        proposal.start_epoch = startDate;
        proposal.type = 1;
        proposal.url = "http://www.dash.org";

        expect(function() {
            return proposal.serialize();
        }).to.throw(errors.GovObject.Proposal.invalidName);
    });
    it('should create a new proposal from a JSON object', function(){
        var jsonProposal = {
          network:"testnet",
          name:"TestProposal",
          start_epoch:startDate,
          end_epoch:endDate,
          payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
          payment_amount:10,
          type:1,
          url:"http://www.dash.org"
        };
        var proposal = new Proposal();
        proposal = proposal.fromObject(jsonProposal);
        expect(proposal instanceof Proposal);
        proposal.serialize().should.equal(expectedHex);

    });
    it('should create a new proposal from a stringified JSON object', function(){
        var jsonProposal = {
          network:"testnet",
          name:"TestProposal",
          start_epoch:startDate,
          end_epoch:endDate,
          payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
          payment_amount:10,
          type:1,
          url:"http://www.dash.org"
        };

        var proposal = new Proposal();
        proposal = proposal.fromObject(JSON.stringify(jsonProposal));
        expect(proposal instanceof Proposal);
        proposal.serialize().should.equal(expectedHex);
    });

    it('should create a new proposal from a hex string', function(){
        var Proposal = bitcore.GovObject.Proposal;
        var proposal = new Proposal(expectedHex);

        expect(proposal instanceof Proposal);
        proposal.serialize().should.equal(expectedHex);
    });
    it('should return error if not valid stringified JSON',function(){

    var stringifiedJSON = JSON.stringify(validJSONProposal);

    //create an invalid stringified JSON
    stringifiedJSON+="foobar";

    var proposal = new Proposal();
    var proposalRes = function(){
      return proposal.fromObject(stringifiedJSON);
    };
    expect(proposalRes).to.throw(Error);
    expect(proposalRes).to.throw('Must be a valid stringified JSON');
  });
  it('should return error if property name is missing',function(){
    var jsonProposal = {
      start_epoch:startDate,
      end_epoch:endDate,
      payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
      payment_amount:10,
      type:1,
      url:"http://www.dash.org"
    };
    var stringifiedJSON = JSON.stringify(jsonProposal);
    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(stringifiedJSON);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property name missing');
  });
  it('should return error if property start_epoch is missing',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    delete jsonProposal.start_epoch;


    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property start_epoch missing');
  });
  it('should return error if property end_epoch is missing',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    delete jsonProposal.end_epoch;


    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property end_epoch missing');
  });
  it('should return error if property payment_address is missing',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    delete jsonProposal.payment_address;


    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property payment_address missing');
  });
  it('should return error if property payment_amount is missing',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    delete jsonProposal.payment_amount;


    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property payment_amount missing');
  });
  it('should return error if property type is missing',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    delete jsonProposal.type;


    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property type missing');
  });
  it('should return error if property url is missing',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    delete jsonProposal.url;


    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Property url missing');
  });
  it('should return error if property name is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.name=1;

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property name to be a string received:number');
  });
  it('should return error if property start_epoch is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.start_epoch="1";

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property start_epoch to be a number received:string');
  });
  it('should return error if property end_epoch is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.end_epoch="1";

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property end_epoch to be a number received:string');
  });
  it('should return error if property payment_address is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.payment_address=1;

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property payment_address to be a string received:number');
  });
  it('should return error if property payment_amount is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.payment_amount="1";

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property payment_amount to be a number received:string');
  });
  it('should return error if property type is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.type="1";

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property type to be a number received:string');
  });
  it('should return error if property type is not a proposal',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.type=42;

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid proposal type.');
  });
  it('should return error if property url is bad typed',function(){
    //Cloning obj
    var jsonProposal = JSON.parse(JSON.stringify(validJSONProposal));
    jsonProposal.url=1;

    var proposal = new Proposal();
     var proposalRes = function(){
       return proposal.fromObject(jsonProposal);
     };

     expect(proposalRes).to.throw(Error);
     expect(proposalRes).to.throw('Must be a valid JSON - Expected property url to be a string received:number');
  });
});
var expectedHex = '5b5b2270726f706f73616c222c7b22656e645f65706f6368223a313736303035343430302c226e616d65223a225465737450726f706f73616c222c227061796d656e745f61646472657373223a22795847654e505158594658684c414e315a4b72416a787a7a426e5a324a5a4e4b6e68222c227061796d656e745f616d6f756e74223a31302c2273746172745f65706f6368223a313434343433353230302c2274797065223a312c2275726c223a22687474703a2f2f7777772e646173682e6f7267227d5d5d';
