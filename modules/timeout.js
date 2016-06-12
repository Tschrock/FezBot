'use strict';

var BotUtil = require('./botutil');

/**
 * Creates/loads a Timeout object
 * @constructor
 * @param {TimeoutManager} manager
 * @param {String} id
 * @param {Integer} defaultMs
 * @returns {Permission}
 */
var Timeout = function (manager, id, defaultMs) {
    this.manager = manager;
    this.id = id;
    this.defaultMs = defaultMs;
    this.ms = false;
    this.lastDateTime = false;
    this.load();
};

/**
 * Loads Timeout properties from storage
 * @returns {undefined}
 */
Timeout.prototype.load = function () {
    var store = this.manager.GetStore();
    if (store.timeouts[this.id]) {
        this.hydrate(store.timeouts[this.id]);
    } else {
        this.ms = this.defaultMs;
        this.save(store);
    }
};

/**
 * Hydrates this Timeout object with the given data
 * @param {Object} data
 * @returns {undefined}
 */
Timeout.prototype.hydrate = function (data) {
    BotUtil.mergeObjects(this, data);
};

/**
 * Saves this Timeout in storage
 * @param {Object} [_store]
 * @returns {undefined}
 */
Timeout.prototype.save = function (_store) {
    var store = _store || this.manager.GetStore();
    store.timeouts[this.id] = {
        id: this.id,
        ms: this.ms,
        lastDateTime: this.lastDateTime
    };
    this.manager.SaveStore(store);
};

/**
 * Returns the number of millisecconds remaining
 * @returns {Number}
 */
Timeout.prototype.remaining = function () {
    return Math.max(0, this.ms - (Date.now() - this.lastDateTime));
};

/**
 * Checks if the timeout has passed
 * @returns {undefined}
 */
Timeout.prototype.check = function () {
    if (this.remaining() > 0) {
        return false;
    }
    this.lastDateTime = Date.now();
    return true;
};

module.exports = Timeout;