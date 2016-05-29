'use strict';

var milliseccondsProp = {
    get: function () {
        var obj = this.storage.getItem(key) || {};
        if (typeof obj.timeouts === 'undefined' || typeof obj[this.id] === 'undefined') {
            obj.timeouts = obj.timeouts || {};
            obj.timeouts[this.id] = this.defaultMillisecconds;
            this.storage.setItem(this.key, obj);
        }
        return obj[this.id];
    },
    set: function (value) {
        var obj = this.storage.getItem(this.key) || {};
        obj.timeouts = obj.timeouts || {};
        obj.timeouts[this.id] = value;
        this.storage.setItem(this.key, obj);
    }
};

var Timeout = function (storage, key, id, defaultMillisecconds) {
    this.storage = storage;
    this.key = key;
    this.id = id;
    this.defaultMillisecconds = defaultMillisecconds;
    this.lasttime = 0;
    Object.defineProperty(this, 'millisecconds', milliseccondsProp);
};
Timeout.prototype.remaining = function () {
    return Math.max(0, this.millisecconds - (Date.now() - this.lasttime));
};
Timeout.prototype.check = function () {
    if (this.remaining() > 0) {
        return false;
    }
    this.lasttime = Date.now();
    return true;
};

var ChannelTimeoutManager = function (storage, key) {
    this.items = {};
    this.storage = storage;
    this.key = key;
};
ChannelTimeoutManager.prototype.get = function (id, defaultTimeout) {
    if (typeof this.items['$' + id] === 'undefined') {
        this.items['$' + id] = new Timeout(this.storage, this.key, id, defaultTimeout);
    }
    return this.items['$' + id];
};
ChannelTimeoutManager.delete = function (id) {
    var obj = this.storage.getItem(this.key) || {};
    delete obj[id];
    this.storage.setItem(this.key, obj);
};

var TIMEOUTS_STORAGEKEY = "timeouts_";

var GlobalTimeoutManager = function (storage) {
    this.items = {};
    this.storage = storage;
    this.allRegex = new RegExp("^" + TIMEOUTS_STORAGEKEY);
};
ChannelTimeoutManager.prototype.get = function (id) {
    if (typeof this.items['$' + id] === 'undefined') {
        this.items['$' + id] = new ChannelTimeoutManager(this.storage, TIMEOUTS_STORAGEKEY + id);
    }
    return this.items['$' + id];
};
ChannelTimeoutManager.prototype.getAll = function () {
    
    this.storage.valuesWithKeyMatch(this.allRegex);
    
    
    if (typeof this.items['$' + id] === 'undefined') {
        this.items['$' + id] = new ChannelTimeoutManager(this.storage, TIMEOUTS_STORAGEKEY + id);
    }
    return this.items['$' + id];
};


module.exports = function (storage) {



    var exports = {};

    return exports;
};