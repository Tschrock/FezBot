'use strict';

var Timeout = require('./timeout');

/**
 * The prefix to use when saving and loading from storage.
 * @type String
 */
var TIMEOUTS_STORAGE_PREFIX = "timeouts_";
var permRegex = new RegExp(TIMEOUTS_STORAGE_PREFIX);

/**
 * A manager for a channel's Timeouts
 * @constructor
 * @param {Storage} storage
 * @param {Channel} channel
 * @returns {PermissionManager}
 */
var TimeoutsManager = function (storage, channel) {
    this.storage = storage;
    this.channel = channel;
};

/**
 * Gets a Timeout
 * @param {String} id
 * @param {Integer} defaultMs
 * @returns {Timeout}
 */
TimeoutsManager.prototype.Get = function (id, defaultMs) {
    return new Timeout(this, id.toLowerCase(), defaultMs);
};

/**
 * Gets the Timeout store
 * @returns {Object}
 */
TimeoutsManager.prototype.GetStore = function () {
    return this.storage.getItem(TIMEOUTS_STORAGE_PREFIX + this.channel.id) || {channel: this.channel.channelName, timeouts: {}};
};

/**
 * Saves a Timeout store
 * @param {Object} store
 * @returns {undefined}
 */
TimeoutsManager.prototype.SaveStore = function (store) {
    this.storage.setItem(TIMEOUTS_STORAGE_PREFIX + this.channel.id, store);
};

/**
 * Gets an array of all Timeout stores
 * @returns {Object[]}
 */
TimeoutsManager.prototype.GetAllStores = function () {
    return this.storage.valuesWithKeyMatch(permRegex);
};

module.exports = TimeoutsManager;