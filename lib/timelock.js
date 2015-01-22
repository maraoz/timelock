'use strict';

var bitcore = require('bitcore');
var $ = bitcore.util.preconditions;
var _ = require('lodash');


var Timelock = function() {
  this.index = 0;
};

Timelock.prototype.ownedBy = function(xpub) {
  this.xpub = xpub;
  return this;
};

Timelock.prototype.getAddress = function(index) {
  $.checkState(this.xpub);
  if (_.isUndefined(index)) {
    index = this.index++;
  }
  return this.xpub.derive(index).publicKey.toAddress();
};


Timelock.prototype.require = function(satoshis) {
  this.satoshisPerMonth = satoshis;
  return this;
};

module.exports = Timelock;
