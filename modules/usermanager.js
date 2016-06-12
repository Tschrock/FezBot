'use strict';

var BotUtil = require('./botutil');
var NiceList = require('./nicelist');
var User = require('./user');

/**
 * Returns an id for a username
 * @private
 * @param {String} name
 * @returns {String}
 */
var idFromUsername = function (name) {
    return name.toLowerCase();
};

/**
 * A user manager
 * @constructor
 * @extends NiceList
 * @param {Channel} channel
 * @returns {UserManager}
 */
var UserManager = function (channel) {
    NiceList.apply(this, arguments);
    /**
     * The channel this UserManager is for
     * @type {Channel}
     */
    this.channel = channel;
};
UserManager.prototype = Object.create(NiceList.prototype);
UserManager.prototype.constructor = NiceList;

/**
 * 
 * @param {String} name
 * @returns {User}
 */
UserManager.prototype.GetByName = function (name) {
    return this.Get(idFromUsername(name));
};
/**
 * Updates a user's information
 * @param {Object} userData
 * @returns {User}
 */
UserManager.prototype.updateUser = function (userData) {
    var user = this.GetByName(userData.username);
    if (!user) {
        this.Add(user = new User(this, userData.username));
    }
    if (typeof userData.admin !== 'undefined')
        user.privilegeLevel = this.channel.permissions.getUserPermissionLevel(userData);
    BotUtil.mergeObjectsWithout(user.extraData, userData, ["username", "admin", "mod", "ptvadmin"]);
    return user;
};
/**
 * Updates the list of users
 * @param {Object[]} userListData
 * @returns {undefined}
 */
UserManager.prototype.updateList = function (userListData) {
    var userList = new NiceList();
    var self = this;
    userListData.forEach(function (u) {
        userList.Add(self.updateUser(u));
    });
    this.items = userList.items;
};

module.exports = UserManager;