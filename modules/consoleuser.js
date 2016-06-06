'use strict';

var User = require('./user');

var ConsoleUser = function () {
    User.apply(this, arguments);
    this.username = "Console";
    this.privilegeLevel = -1;
};
ConsoleUser.prototype = Object.create(User.prototype);
ConsoleUser.prototype.constructor = User;

module.exports = ConsoleUser;