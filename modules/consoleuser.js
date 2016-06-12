'use strict';

var User = require('./user');

/**
 * An implimentation of User for ConsoleChannel.
 * @constructor
 * @extends User
 */
var ConsoleUser = function () {
    User.apply(this, arguments);
    this.username = "Console";
    this.privilegeLevel = -1;
};
ConsoleUser.prototype = Object.create(User.prototype);
ConsoleUser.prototype.constructor = User;

module.exports = ConsoleUser;