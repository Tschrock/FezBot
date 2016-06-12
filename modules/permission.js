'use strict';

var BotUtil = require('./botutil');
var PermissionLevels = require('./permissionlevels');

/**
 * Creates/loads a permission object
 * @constructor
 * @param {PermissionsManager} manager
 * @param {String} id
 * @param {Integer} defaultLevel
 * @returns {Permission}
 */
var Permission = function (manager, id, defaultLevel) {
    /**
     * The PermissionsManager in charge of the permission
     * @type PermissionsManager
     */
    this.manager = manager;
    /**
     * The id of the permission
     * @type String
     */
    this.id = id;
    this.defaultLevel = defaultLevel || (PermissionLevels.PERMISSION_ADMIN | PermissionLevels.PERMISSION_MOD);
    this.level = false;
    this.whitelist = {};
    this.blacklist = {};
    this.load();
};

/**
 * Loads permission properties from storage
 * @returns {undefined}
 */
Permission.prototype.load = function () {
    var store = this.manager.GetStore();
    if (store.permissions[this.id] && store.permissions[this.id].level) {
        this.hydrate(store.permissions[this.id]);
    } else {
        this.level = this.defaultLevel;
        this.save(store);
    }
};

/**
 * Hydrates this permissions object with the given data
 * @param {Object} data
 * @returns {undefined}
 */
Permission.prototype.hydrate = function (data) {
    if (data.id) this.id = data.id;
    this.level = data.level || this.defaultLevel;
    this.whitelist = data.whitelist || {};
    this.blacklist = data.blacklist || {};
};

/**
 * Saves this permission in storage
 * @param {Object} [_store]
 * @returns {undefined}
 */
Permission.prototype.save = function (_store) {
    var store = _store || this.manager.GetStore();
    store.permissions[this.id] = {
        id: this.id,
        level: this.level,
        whitelist: this.whitelist,
        blacklist: this.blacklist
    };
    this.manager.SaveStore(store);
};

/**
 * Checks if a user has this permission
 * @param {User} user
 * @returns {Boolean}
 */
Permission.prototype.check = function (user) {
    return !this.blacklist[user.id] && (((this.level & user.privilegeLevel) !== 0) || (this.whitelist[user.id] && user.registered));
};

/**
 * Blacklists the given user
 * @param {User} user
 * @returns {undefined}
 */
Permission.prototype.blacklist = function (user) {
    this.blacklist[user.id] = user.username;
    this.save();
};

/**
 * Unblacklists the given user
 * @param {User} user
 * @returns {undefined}
 */
Permission.prototype.unblacklist = function (user) {
    delete this.blacklist[user.id];
    this.save();
};

/**
 * Whitelists the given user
 * @param {User} user
 * @returns {undefined}
 */
Permission.prototype.whitelist = function (user) {
    this.whitelist[user.id] = user.username;
    this.save();
};

/**
 * Unwhitelists the given user
 * @param {User} user
 * @returns {undefined}
 */
Permission.prototype.unwhitelist = function (user) {
    delete this.whitelist[user.id];
    this.save();
};

module.exports = Permission;