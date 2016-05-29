'use strict';

var Message = require('./message');

/**
 * A command
 * @constructor
 * @extends Message
 * @param {Channel} channel
 * @param {Date} recieveDate
 * @param {User} sender
 * @param {String} content
 * @param {Number} id
 * @param {MESSAGE_TYPES} type
 * @param {Object} extraData
 * @returns {CommandMessage}
 */
var CommandMessage = function () {
    if (arguments[0] instanceof Message) {
        this.prototype = Object.create(arguments[0]);
    } else {
        Message.apply(this, arguments);
    }
    this.command = this.content.split(" ")[0].replace(/^!/, "").toLowerCase();
    this.parameters = this.content.split(' ').slice(1);
};
CommandMessage.prototype = Object.create(Message.prototype);
CommandMessage.prototype.constructor = Message;

module.exports = CommandMessage;