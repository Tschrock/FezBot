'use strict';

var MessageType = require('./messagetypes');

/**
 * A chat message
 * @constructor
 * @param {Channel} channel
 * @param {Date} recieveDate
 * @param {User} sender
 * @param {String} content
 * @param {Number} id
 * @param {MESSAGE_TYPES} type
 * @param {Object} extraData
 * @returns {Message}
 */
var Message = function (channel, recieveDate, sender, content, id, type, extraData) {
    this.channel = channel;
    this.recieveDate = recieveDate;
    this.sender = sender;
    this.content = content;
    this.id = id;
    this.type = type;
    this.extraData = extraData;
};
/**
 * Sends a reply
 * @param {String} message
 * @returns {Boolean} Whether or not the message was successfully queued for sending
 */
Message.prototype.reply = function (message) {
    return this.channel.sendMessage(this.type, message, this.sender);
};
/**
 * Sends a private reply
 * @param {String} message
 * @returns {Boolean} Whether or not the message was successfully queued for sending
 */
Message.prototype.replyPrivate = function (message) {
    return this.channel.sendMessage(MessageType.PRIVATE, message, this.sender);
    // or
    return this.sender.sendPrivateMessage(message);
};

Message.prototype.isDuplicate = function () {
    // TODO: implement Message.isDuplicate()
    return false;
};

module.exports = Message;