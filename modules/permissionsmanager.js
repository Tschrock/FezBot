'use strict';

var Permission = require('./permission');

/**
 * The prefix to use when saving and loading from storage.
 * @type String
 */
var PERMISSIONS_STORAGE_PREFIX = "permissions_";
var permRegex = new RegExp(PERMISSIONS_STORAGE_PREFIX);

/**
 * A manager for a channel's permissions
 * @constructor
 * @param {Storage} storage
 * @param {Channel} channel
 * @returns {PermissionManager}
 */
var PermissionsManager = function (storage, channel) {
    this.storage = storage;
    this.channel = channel;
};

/**
 * Gets a permission
 * @param {String} id
 * @param {Integer} defaultPermissionLevel
 * @returns {Permission}
 */
PermissionsManager.prototype.Get = function (id, defaultPermissionLevel) {
    return new Permission(this, id.toLowerCase(), defaultPermissionLevel);
};

/**
 * Gets the permission store
 * @returns {Object}
 */
PermissionsManager.prototype.GetStore = function () {
    return this.storage.getItem(PERMISSIONS_STORAGE_PREFIX + this.channel.id) || {channel: this.channel.channelName, permissions: {}};
};

/**
 * Saves a permission store
 * @param {Object} store
 * @returns {undefined}
 */
PermissionsManager.prototype.SaveStore = function (store) {
    this.storage.setItem(PERMISSIONS_STORAGE_PREFIX + this.channel.id, store);
};

/**
 * Gets an array of all permission stores
 * @returns {Object[]}
 */
PermissionsManager.prototype.GetAllStores = function () {
    return this.storage.valuesWithKeyMatch(permRegex);
};

PermissionsManager.prototype.getUserPermissionLevel = function (userData) {
    return !(userData.admin || userData.mod || userData.ptvadmin) | userData.admin << 1 | userData.mod << 2 | userData.ptvadmin << 3;
};

module.exports = PermissionsManager;