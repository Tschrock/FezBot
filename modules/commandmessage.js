'use strict';

var Message = require('./message');
var NiceList = require('./nicelist');

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
var CommandMessage = function (channel, recieveDate, sender, content, id, type, extraData) {
    if (arguments[0] instanceof Message) {
        Message.call(this,
                arguments[0].channel,
                arguments[0].recieveDate,
                arguments[0].sender,
                arguments[0].content,
                arguments[0].id,
                arguments[0].type,
                arguments[0].extraData
                );
    } else {
        Message.apply(this, arguments);
    }
    this.command = this.content.split(" ")[0].replace(/^!/, "").toLowerCase();
    this.parameters = this.content.split(' ').slice(1);
    this.completionList = new NiceList();
};
CommandMessage.prototype = Object.create(Message.prototype);
CommandMessage.prototype.constructor = Message;


CommandMessage.prototype.checkCompletion = function (testStr) {
    if (this.content.length <= testStr.length && testStr.lastIndexOf(this.content, 0) === 0) {
        this.completionList.Add(testStr);
    }
};

module.exports = CommandMessage;