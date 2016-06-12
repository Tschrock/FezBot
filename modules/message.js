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
    /**
     * The channel the message was recieved from
     * @type Channel
     */
    this.channel = channel;
    /**
     * The date the message was recieved
     * @type Date
     */
    this.recieveDate = recieveDate;
    /**
     * The sender of the message
     * @type User
     */
    this.sender = sender;
    /**
     * The content of the message
     * @type String
     */
    this.content = content;
    /**
     * The id of the message
     * @type Object
     */
    this.id = id;
    /**
     * The type of message
     * @type Integer
     */
    this.type = type;
    /**
     * Extra data associated with the message
     * @type Object
     */
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
/**
 * Checks to see if the message is a duplicate
 * @returns {Boolean}
 */
Message.prototype.isDuplicate = function () {
    // TODO: implement Message.isDuplicate()
    return false;
};

module.exports = Message;