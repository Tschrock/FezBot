'use strict';

/**
 * The cooldown between sending messages
 * @constant
 * @memberOf Channel
 * @protected
 * @type Number
 */
var SENDMESSAGE_MINTIME = 600;

/**
 * The maximum length of individual messages.
 * @constant
 * @memberOf Channel
 * @protected
 * @type Number
 */
var SENDMESSAGE_MAXLENGTH = 255;

/**
 * The maximum ammount of times to allow splitting a message.
 * @constant
 * @memberOf Channel
 * @protected
 * @type Number
 */
var SENDMESSAGE_MAXSPLIT = 5;

var io = require("socket.io-client");
var Entities = require("entities");
var BotUtil = require('./botutil');
var BotEvent = require('./botevent');
var MessageType = require('./messagetypes');
var Message = require('./message');
var CommandMessage = require('./commandmessage');
var PermissionsManager = require('./permissionsmanager');
var TimeoutsManager = require('./timeoutsmanager');
var UserManager = require('./usermanager');
var EventTypes = require('./eventtypes');

var idFromChannelName = function () {
    return this.channelName.toLowerCase();
};

/**
 * @constant
 * @memberOf Channel
 * @protected
 * @type String[]
 */
var PASSTHROUGH_EVENTS = ["connect", "disconnect", "reconnect", "reconnect_attempt", "chatMode", "channelUsers", "srvMsg", "globalMsg", "clearChat", "commandHelp", "modToolsVisible", "modList", "color", "onlineState", "raffleUsers", "wonRaffle", "runPoll", "showPoll", "pollVotes", "voteResponse", "finishPoll", "gameMode", "adultMode", "commissionsAvailable", "clearUser", "removeMsg", "warnAdult", "warnGaming", "warnMovies", "multiStatus", "endHistory", "ignores"];

/**
 * A channel
 * @constructor
 * @param {API} api
 * @param {String} token
 * @param {String} channelName
 * @param {String} accountName
 * @returns {Channel}
 */
var Channel = function (api, token, channelName, accountName) {
    if (!token)
        throw new Error("Error: no token!");
    if (!channelName)
        throw new Error("Error: no channelName!");
    if (!accountName)
        console.warn("Warning: No accountName!");

    var self = this;

    this._api = api;
    this._token = token;
    /**
     * The name of the channel
     * @type String
     */
    this.channelName = channelName;
    this.id = channelName.toLowerCase();
    /**
     * The bot's name
     * @type String
     */
    this.accountname = accountName;
    /**
     * The channel's user manager
     * @type UserManager
     */
    this.onlineUsers = new UserManager(this);
    /**
     * The channel's permissions manager
     * @type PermissionsManager
     */
    this.permissions = new PermissionsManager(api.mainAppStorage, this);
    /**
     * The channel's timeout manager
     * @type TimeoutsManager
     */
    this.timeouts = new TimeoutsManager(api.mainAppStorage, this);
    var inChatHistory = true;

    function wrapEvent(event, callback) {
        return function (data) {
            var eData = new BotEvent(event, self, data);
            try {
                callback.call(self, eData);
            } catch (e) {
                var eeData = new BotEvent("exception", self, {event: eData, exception: e});
                try {
                    api.events.emit("exception", eeData);
                } catch (e) {
                    console.log("Error handling exception:");
                    console.log(e);
                    console.log(e.stack);
                }
            }
        };
    }

    function passthroughEvent(event) {
        return wrapEvent(event, function (eData) {
            api.events.emit(event, eData);
        });
    }

    this.socket = BotUtil.interceptSocketEvents(io.connect("https://nd1.picarto.tv:443", {
        secure: true,
        forceNew: true,
        query: "token=" + this._token
    }), function (data) {
        //console.log(data);
    });

    PASSTHROUGH_EVENTS.forEach(function (e) {
        self.socket.on(e, passthroughEvent(e));
    });

    this.socket.on(EventTypes.ENDHISTORY, function () {
        inChatHistory = false;
    });

    this.socket.on(EventTypes.CHANNELUSERS, function (data) {
        self.onlineUsers.updateList(data);
    });
    this.socket.on(EventTypes.USERMESSAGE, wrapEvent(EventTypes.USERMESSAGE, function (event) {
        event.data = new Message(self, new Date(), self.onlineUsers.updateUser(event.data), Entities.decode(event.data.msg), event.data.id, MessageType.GENERIC, BotUtil.copyObjectWithout(event.data, ["id", "username", "msg"]));
        if (event.data.content.indexOf('!') === 0) {
            event.data = new CommandMessage(event.data);
            api.events.emit(event.type = EventTypes.CHATCOMMAND + ((inChatHistory || event.data.isDuplicate()) ? "Duplicate" : ""), event);
            if (event.type === EventTypes.CHATCOMMAND && !event.claimed) {
                event.data.reply("Command not found :(");
            }
        } else {
            api.events.emit(event.type = EventTypes.USERMESSAGE + ((inChatHistory || event.data.isDuplicate()) ? "Duplicate" : ""), event);
        }
    }));
    this.socket.on(EventTypes.MEMESSAGE, wrapEvent(EventTypes.MEMESSAGE, function (event) {
        event.data = new Message(self, new Date(), self.onlineUsers.updateUser(event.data), Entities.decode(event.data.msg), event.data.id, MessageType.SELF, BotUtil.copyObjectWithout(event.data, ["id", "username", "msg"]));
        api.events.emit(event.type = EventTypes.MEMESSAGE + (inChatHistory || event.data.isDuplicate()) ? "Duplicate" : "", event);
    }));
    this.socket.on(EventTypes.WHISPER, wrapEvent(EventTypes.WHISPER, function (event) {
        event.data = new Message(self, new Date(), self.onlineUsers.updateUser(event.data), Entities.decode(event.data.msg), 'p' + Math.floor(Math.random() * 1000000000), MessageType.PRIVATE, BotUtil.copyObjectWithout(event.data, ["username", "msg"]));
        if (event.data.content.startsWith('!')) {
            event.data = new CommandMessage(event.data);
            api.events.emit(event.type = EventTypes.CHATCOMMAND, event);
        } else {
            api.events.emit(event.type = EventTypes.WHISPER, event);
        }
    }));
};
/**
 * Returns whether or not the channel is connected
 * @returns {Boolean}
 */
Channel.prototype.isConnected = function () {
    return this.socket.connected;
};
/**
 * Attempts to connect the channel
 * @returns {undefined}
 */
Channel.prototype.connect = function () {
    this.socket.connect();
};
/**
 * Disconnects the channel
 * @returns {undefined}
 */
Channel.prototype.disconnect = function () {
    this.socket.disconnect();
};
/**
 * Returns whether or not the channel is in ReadOnly mode
 * @returns {Boolean}
 */
Channel.prototype.isReadOnly = function () {
    return this._readOnly;
};
/**
 * Returns whether or not the channel is muted
 * @returns {Boolean}
 */
Channel.prototype.isMuted = function () {
    return this._muted;
};
/**
 * Mutes the channel
 * @returns {undefined}
 */
Channel.prototype.mute = function () {
    this._muted = true;
};
/**
 * Unmutes the channel
 * @returns {undefined}
 */
Channel.prototype.unmute = function () {
    this._muted = false;
};
/**
 * Returns whether or not a message can be sent
 * @returns {Boolean}
 */
Channel.prototype.canSpeak = function () {
    return this.isConnected() && !this.isReadOnly() && !this.isMuted();
};
/**
 * Emits an event to the underlying Socket, complying with SENDMESSAGE_MINTIME
 * @param {String} type
 * @param {Object} data
 * @returns {undefined}
 */
Channel.prototype._emit = function (type, data) {
    if (this._lastEmitTime + SENDMESSAGE_MINTIME > new Date()) {
        var self = this;
        setTimeout(function () {
            self._emit(type, data);
        }, SENDMESSAGE_MINTIME + 1);
    } else {
        this._lastEmitTime = new Date();
        this.socket.emit(type, data);
    }
};
/**
 * Sends a message
 * @param {MessageType} messageType
 * @param {String} content
 * @param {User} [_recipient]
 * @returns {Boolean}
 */
Channel.prototype.sendMessage = function (messageType, content, _recipient) {
    if (typeof content === 'undefined') {
        content = messageType;
        messageType = MessageType.GENERIC;
    }

    var preContent = "";
    switch (messageType) {
        case MessageType.GENERIC:
            preContent = "";
            break;
        case MessageType.PRIVATE:
            preContent = "/w " + _recipient.username + " ";
            break;
        case MessageType.SELF:
            preContent = "/me ";
            break;
        case MessageType.SYSTEM:
            throw new Error("Can't send system messages!");
            break;
        default:
            throw new Error("Unknown message type!");
    }

    if (!this.isConnected()) {
        console.warn("Failed to send message: Channel '" + this.channelName + "' is not connected!");
        return false;
    }
    if (this.isReadOnly()) {
        console.warn("Failed to send message: Channel '" + this.channelName + "' is read-only!");
        return false;
    }
    if (this.isMuted()) {
        console.info("Failed to send message: Channel '" + this.channelName + "' is muted.");
        return false;
    }

    var timesSplit = Math.ceil(content.length / (SENDMESSAGE_MAXLENGTH - preContent.length));
    if (timesSplit > SENDMESSAGE_MAXSPLIT) {
        console.warn("Failed to send message: Message too long!");
        this.sendMessage(messageType, "Error: Message too long :(", _recipient);
        return false;
    }

    var msgToSend = preContent + content.slice(0, SENDMESSAGE_MAXLENGTH - preContent.length);
    var msgRemaining = content.slice(SENDMESSAGE_MAXLENGTH - preContent.length);

    this._emit("chatMsg", {
        msg: msgToSend
    });

    if (msgRemaining.length > 0) {
        this.sendMessage(messageType, msgRemaining, _recipient);
    }
    return true;
};
/**
 * Sends a command through the underlying socket
 * @param {string} command
 * @param {object} data
 * @returns {Boolean}
 */
Channel.prototype.sendSocketCommand = function (command, data) {
    if (!this.isConnected()) {
        console.warn("Failed to send message: Channel '" + this.channelName + "' is not connected!");
        return false;
    }
    this._emit(command, data);
    return true;
};
/**
 * Gets a timout
 * @param {String} id
 * @param {Integer} defaultMs
 * @returns {Timeout}
 */
Channel.prototype.getTimeout = function (id, defaultMs) {
    return this.timeouts.Get(id, defaultMs);
};
/**
 * Gets a permission
 * @param {String} id
 * @param {Integer} defaultLevel
 * @returns {Permission}
 */
Channel.prototype.getPermission = function (id, defaultLevel) {
    return this.permissions.Get(id, defaultLevel);
};
/**
 * Checks a timeout
 * @param {String} id
 * @param {Integer} defaultMs
 * @returns {Boolean}
 */
Channel.prototype.checkTimeout = function (id, defaultMs) {
    return this.getTimeout(id, defaultMs).check();
};
/**
 * Checks if a user has a permission
 * @param {User} user
 * @param {String} id
 * @param {PermissionLevel} defaultLevel
 * @returns {Boolean}
 */
Channel.prototype.checkPermission = function (user, id, defaultLevel) {
    return this.getPermission(id, defaultLevel).check(user);
};
/**
 * Gets the default rejection message for a timeout.
 * @param {String} id
 * @returns {String}
 */
Channel.prototype.getTimeoutMessage = function (id) {
    return "Too soon, wait another " + this.getTimeout(id).timeRemaining() + " sec. and try again.";
};
/**
 * Gets the default rejection message for a permission.
 * @returns {String}
 */
Channel.prototype.getPermissionMessage = function () {
    return "Sorry, you don't have permission to use this command.";
};

module.exports = Channel;