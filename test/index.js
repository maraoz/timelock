'use strict';

var chai = require('chai');
var should = chai.should();

var bitcore = require('bitcore');
var HDPublicKey = bitcore.HDPublicKey;
var Address = bitcore.Address;

var Timelock = require('../');

describe('timelock', function() {

  var xpub = new HDPublicKey('xpub661MyMwAqRbcGbpM3dQD2eVTKsvAb2kuUo1CCAAmmExmcxJ4HjjUbUA3jpxssce4KZ6pDmfnSHz7uXDdF6wUACVR5BNt7u6uDcNf1cMuSCa');

  it('exists', function() {
    should.exist(Timelock);
  });

  it('instantiates', function() {
    var timelock = new Timelock();
    should.exist(timelock);
  });

  it('setups hd public key', function() {
    var timelock = new Timelock()
      .ownedBy(xpub);
    should.exist(timelock);
  });

  var t = new Timelock()
    .ownedBy(xpub);
  it('gets new addresses', function() {
    var a1 = t.getAddress();
    (a1 instanceof Address).should.equal(true);
    var a2 = t.getAddress();
    a1.toString().should.not.equal(a2.toString());
  });

  it('gets new addresses', function() {
    var a1 = t.getAddress(7);
    var a2 = t.getAddress(7);
    a1.toString().should.equal(a2.toString());
  });



});
