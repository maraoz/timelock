'use strict';

var chai = require('chai');
var should = chai.should();

var bitcore = require('bitcore');
var HDPublicKey = bitcore.HDPublicKey;
var Address = bitcore.Address;
var Transaction = bitcore.Transaction;
var Script = bitcore.Script;

var moment = require('moment');
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

  var t = new Timelock()
    .ownedBy(xpub);
  describe('basic address management', function() {
    it('setups hd public key', function() {
      should.exist(t);
      should.exist(t.xpub);
    });

    it('gets new addresses', function() {
      var a1 = t.getAddress();
      (a1 instanceof Address).should.equal(true);
      var a2 = t.getAddress();
      a1.toString().should.not.equal(a2.toString());
    });

    it('gets fixed addresses', function() {
      var a1 = t.getAddress(7);
      var a2 = t.getAddress(7);
      a1.toString().should.equal(a2.toString());
    });
  });

  describe('sets incentive policies', function() {
    it('sets', function() {
      var satoshis = 100000000; // 1 BTC per month
      t.require(satoshis);
    });
  });

  describe('recognize payments', function() {

    it('rejects unrelated tx', function() {
      var raw = '01000000015884e5db9de218238671572340b207ee85' +
        'b628074e7e467096c267266baf77a4000000006a473044022013' +
        'fa3089327b50263029265572ae1b022a91d10ac80eb4f32f291c' +
        '914533670b02200d8a5ed5f62634a7e1a0dc9188a3cc460a9862' +
        '67ae4d58faf50c79105431327501210223078d2942df62c45621' +
        'd209fab84ea9a7a23346201b7727b9b45a29c4e76f5effffffff' +
        '0150690f00000000001976a9147821c0a3768aa9d1a37e16cf76' +
        '002aef5373f1a888ac00000000';

      var tx = new Transaction(raw);
      //t.accepts(tx).should.equal(false);

    });

    var clientPK = new bitcore.PrivateKey();
    var ca = clientPK.toAddress();
    var outScript = Script.buildPublicKeyHashOut(ca).toString();
    var clientUTXO = {
      address: ca.toString(),
      txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
      outputIndex: 0,
      script: outScript,
      satoshis: 1000000000
    };
    var a = t.getAddress(0);
    it('accepts non-locked tx', function() {
      // this tx sends 1 bitcoin to an address in the timelock
      // and can be broadcast immediately (no nLockTime)
      // thus, the timelock should accept it
      var tx = new Transaction()
        .from(clientUTXO)
        .to(a, 100000000)
        .change(ca.toString())
        .sign(clientPK);
      //t.accepts(tx).should.equal(true);
    });

    it('rejects time-locked tx with not enough incentives', function() {
      // this tx sends 1 bitcoin but needs to be stored for
      // 40 days. Given the set incentive policies, the
      // timelock should reject it
      var tx = new Transaction()
        .from(clientUTXO)
        .to(a, 100000000)
        .change(ca.toString())
        .sign(clientPK);
      var now = moment();
      var future = now.add(40, 'days');
      tx.lockUntil(future.toDate());
      //t.accepts(tx).should.equal(false);
    });

    it('accepts time-locked tx with more than enough incentives', function() {
      // this tx sends 1 bitcoin and only needs to be stored
      // for 15 days. The incentive policies say the
      // timelock should accept it
      var tx = new Transaction()
        .from(clientUTXO)
        .to(a, 100000000)
        .change(ca.toString())
        .sign(clientPK);
      var now = moment();
      var future = now.add(15, 'days');
      tx.lockUntil(future.toDate());
      //t.accepts(tx).should.equal(true);
    });

    it('accepts time-locked tx with exact incentives', function() {
      // this tx sends 1 bitcoin and needs to be stored
      // for 30 days, which is exactly how long the timelock
      // will hold a transaction for 1 BTC. Thus, it should
      // accept it
      var tx = new Transaction()
        .from(clientUTXO)
        .to(a, 100000000)
        .change(ca.toString())
        .sign(clientPK);
      var now = moment();
      var future = now.add(30, 'days');
      tx.lockUntil(future.toDate());
      //t.accepts(tx).should.equal(true);
    });

  });


});
