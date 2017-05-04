/* jshint unused: false */
/* jshint latedef: false */
var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('lodash');
var sinon = require('sinon');

var bitcore = require('../..');
var GovObject = bitcore.GovObject;
var Proposal = bitcore.GovObject.Proposal;
var errors = bitcore.errors;


var BufferReader = require('../../lib/encoding/bufferreader');


/* FromObject */
describe('GovObject', function(){


  describe('GovObject - FromObject', function(){
    it('should cast a JSON Proposal into a Proposal Object', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };

      govObject = govObject.fromObject(jsonProposal);
      var govObjRes = function(){
        return govObject.fromObject(jsonProposal);
      };
      expect(govObject instanceof Proposal);
      expect(govObjRes).to.not.throw(Error);
      expect(govObjRes).to.not.throw('Unhandled GovObject type');
      govObject.serialize().should.equal(expectedHex);
    })
    it('should validate address', function(){
      var govObject = new GovObject;
      govObject._verifyAddress('yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh','testnet').should.equal(true);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B6','livenet').should.equal(true);
      govObject._verifyAddress('XuYDEzZzKxn&&knPDiVKe91sJasfajkshfjD1nQnnn5B6','livenet').should.equal(false);
      govObject._verifyAddress('knPDiVKe91sJasfajkshfjD1nQnnn5B6','testnet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxn&&knPDiVKe91sJa/sfajkshfjD1nQnnn5B6','livenet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B','livenet').should.equal(false);
      govObject._verifyAddress(' XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B','livenet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B ','livenet').should.equal(false);
      govObject._verifyAddress('$XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B','livenet').should.equal(false);
      govObject._verifyAddress('yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh','livenet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B6','testnet').should.equal(false);
    })
    it('should cast a stringified JSON Proposal into a Proposal Object', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };

      var govObject = govObject.fromObject(JSON.stringify(jsonProposal));

      expect(govObject instanceof Proposal);

      govObject.serialize().should.equal(expectedHex);
    })
    it('should shallowCopy a govObject if passed as arg', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var govObject = govObject.fromObject(jsonProposal);
      var newGovObject = new GovObject(govObject);
      var shallowCopy = GovObject.shallowCopy(govObject);

      //Have the same values
      expect(shallowCopy).to.deep.equal(govObject);
      //but are distinct object (not reference - === verif)
      expect(shallowCopy).to.not.equal(govObject);

      expect(newGovObject).to.deep.equal(govObject);
      expect(newGovObject).to.not.equal(govObject);

      expect(newGovObject).to.deep.equal(shallowCopy);
      expect(newGovObject).to.not.equal(shallowCopy);

    })
    it('should create a govObject from a buffer', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var govObject = govObject.fromObject(jsonProposal);

      var govFromBuffer = new GovObject;
      govFromBuffer.fromBuffer(govObject.toBuffer()).should.deep.equal(govObject);
      govFromBuffer.fromBuffer(govObject.toBuffer()).should.not.equal(govObject);
      new GovObject(govObject.toBuffer()).should.deep.equal(govObject);
      new GovObject(govObject.toBuffer()).should.not.equal(govObject);


      var reader = new BufferReader(govObject.toBuffer());
      var fromBuff =govFromBuffer.fromBufferReader(reader);
      fromBuff.should.deep.equal(govObject);
      fromBuff.should.not.equal(govObject);
    })
    it('should create a govObject from an Object', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var govObject = govObject.fromObject(jsonProposal);
      var govObject2 = new GovObject;

      //Use a polyfill for object.assign FIXME when node>=4 (actual 0.10.25)
      new GovObject(Object._assign(new Object , govObject)).should.deep.equal(govObject);
      new GovObject(Object._assign(new Object , govObject)).should.not.equal(govObject);

      new GovObject(Object._assign(new Object , govObject)).should.deep.equal(govObject2.fromObject(jsonProposal))
      new GovObject(Object._assign(new Object , govObject)).should.not.equal(govObject2.fromObject(jsonProposal))
    })
    it('should create a govObject from an hexa string', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var govObject = govObject.fromObject(jsonProposal);
      var govFromHexa = new GovObject;

      govFromHexa.fromString(govObject.toString()).should.deep.equal(govObject);
      govFromHexa.fromString(govObject.toString()).should.not.equal(govObject);
      new GovObject(govObject.toString()).should.deep.equal(govObject);
      new GovObject(govObject.toString()).should.not.equal(govObject);
    })

    it('should return an error is stringified JSON Proposal is not valid', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var stringified = JSON.stringify(jsonProposal);
      stringified+="foobar";

       var govObjectRes = function(){
         return govObject.fromObject(stringified);
       };

       expect(govObjectRes).to.throw(Error);
       expect(govObjectRes).to.throw('Must be a valid stringified JSON');
    })
    it('should return error if property type is not defined',function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        url:"http://www.dash.org"
      };

       var govObjRes = function(){
         return govObject.fromObject(jsonProposal);
       };

       expect(govObjRes).to.throw(Error);
       expect(govObjRes).to.throw('Must be a valid JSON - Property type missing');
    });
    it('should return error if property type is bad typed',function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        type:"foobar",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        url:"http://www.dash.org"
      };

       var govObjRes = function(){
         return govObject.fromObject(jsonProposal);
       };

       expect(govObjRes).to.throw(Error);
       expect(govObjRes).to.throw('Must be a valid JSON - Expected property type to be a number received:string');
    });
    it('should return error if govObject type is not handled',function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        type:42,
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        url:"http://www.dash.org"
      };
       var govObjRes = function(){
         return govObject.fromObject(jsonProposal);
       };

       expect(govObjRes).to.throw(Error);
       expect(govObjRes).to.throw('Unhandled GovObject type');
    });
    it('should output null data-hex value by default', function(){
      var govObject = new GovObject;
      expect(govObject.dataHex()).to.be.null();
    })

    it('should throw error when creating a bad new GovObject', function(){
      var govObjRes = function(){
        return  new GovObject(true);
      };
      expect(govObjRes).to.throw(Error);
      expect(govObjRes).to.throw('Must provide an object or string to deserialize a transaction');
    })
    it('should serialize',function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var govObject = govObject.fromObject(jsonProposal);
      govObject.serialize().should.equal(expectedHex);
      govObject.serialize().should.equal(govObject.uncheckedSerialize());
    });
    it('should be able to inspect a govObject', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_epoch:Math.round(new Date("2015-10-10").getTime()/1000),
        end_epoch:Math.round(new Date("2025-10-10").getTime()/1000),
        payment_address:'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh',
        payment_amount:10,
        type:1,
        url:"http://www.dash.org"
      };
      var govObject = govObject.fromObject(jsonProposal);
      govObject.inspect().should.equal("<GovObject: "+expectedHex+">");
      govObject.inspect().should.equal("<GovObject: "+govObject.uncheckedSerialize()+">");

    })

  });
});
var expectedHex = "5b5b2270726f706f73616c222c7b22656e645f65706f6368223a313736303035343430302c226e616d65223a225465737450726f706f73616c222c227061796d656e745f61646472657373223a22795847654e505158594658684c414e315a4b72416a787a7a426e5a324a5a4e4b6e68222c227061796d656e745f616d6f756e74223a31302c2273746172745f65706f6368223a313434343433353230302c2274797065223a312c2275726c223a22687474703a2f2f7777772e646173682e6f7267227d5d5d";
//Polyfill for object.assign (not supported in 0.10.25);
Object._assign = function (target, varArgs) { // .length of function is 2
  'use strict';
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
};
