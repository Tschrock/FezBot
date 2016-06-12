'use strict';

var PermissionsManager = require('./permissionsmanager');
var TimeoutsManager = require('./timeoutsmanager');
var UserManager = require('./usermanager');
var Channel = require('./channel');
var ConsoleUser = require('./consoleuser');

/**
 * An implimentation of Channel for stdio.
 * @constructor
 * @extends Channel
 * @param {API} api
 * @param {Stream} stdin
 * @param {Stream} stdout
 * @returns {ConsoleChannel}
 */
var ConsoleChannel = function (api, stdin, stdout) {
    this._api = api;
    this._token = "";
    this.channelName = "Console";
    this.id = "console";
    this.accountname = "Console";
    this.onlineUsers = new UserManager(this);
    this.stdinUser = new ConsoleUser(this.onlineUsers);
    this.onlineUsers.Add(this.stdinUser);
    this._stdin = stdin;
    this._stdout = stdout;
    this.permissions = new PermissionsManager(api.mainAppStorage, this);
    this.timeouts = new TimeoutsManager(api.mainAppStorage, this);
};
ConsoleChannel.prototype = Object.create(Channel.prototype);
ConsoleChannel.prototype.constructor = Channel;

ConsoleChannel.prototype.connect = function () {
    console.error("Error: cannot 'connect()' console channel.");
    return false;
};
ConsoleChannel.prototype.disconnect = function () {
    console.error("Error: cannot 'disconnect()' console channel.");
    return false;
};
ConsoleChannel.prototype.isConnected = function () {
    return true;
};
ConsoleChannel.prototype.isMuted = function () {
    return false;
};
ConsoleChannel.prototype.sendMessage = function (messageType, content) {
    this._stdout.write(content + "\n");
    return true;
};
ConsoleChannel.prototype.checkTimeout = function () {
    return true;
};

module.exports = ConsoleChannel;