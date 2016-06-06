'use strict';

var MessageType = require('./messagetypes');

/**
 * Returns an id for a username
 * @returns {String}
 */
var idFromUsername = function () {
    return this.username.toLowerCase();
};

/**
 * A user
 * @constructor
 * @param {UserManager} usermanager
 * @param {String} username
 * @returns {User}
 */
var User = function (usermanager, username) {
    this._usermanager = usermanager;
    this.channel = usermanager.channel;
    this.username = username;
    this.privilegeLevel = 0;
    this.extraData = {};
    Object.defineProperty(this, "id", {get: idFromUsername});
};
/**
 * Checks a permission
 * @param {String} id
 * @param {Integer} defaultLevel
 * @returns {Boolean} Whether or not the User has permission
 */
User.prototype.hasPermission = function (id, defaultLevel) {
    return this.channel.getPermission(id, defaultLevel).check(this);
};
/**
 * Sends a private message to the User
 * @param {String} content
 * @returns {Boolean} Whether or not the message was successfully queued for sending
 */
User.prototype.sendPrivateMessage = function (content) {
    return this.channel.sendMessage(MessageType.PRIVATE, content, this);
};
/**
 * Creates a new User who impersonates the permissions of `user`
 * @param {User} user the user to impersonate
 * @returns {User}
 */
User.impersonate = function (user) {
    var u = Object.create(user);
    u.impersonator = this;
    return u;
};

module.exports = User;