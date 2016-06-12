'use strict';

var NiceList = require('./nicelist');
var Channel = require('./channel');

/**
 * A channel manager
 * @constructor
 * @extends NiceList
 * @param {API} api The api
 * @returns {ChannelManager}
 */
var ChannelManager = function (api) {
    NiceList.apply(this, arguments);
    this._api = api;
};
ChannelManager.prototype = Object.create(NiceList.prototype);
ChannelManager.prototype.constructor = NiceList;

/**
 * Creates a new channel
 * @param {String} token
 * @param {String} channelName
 * @param {String} accountName
 * @param {Boolean=} replaceExisting
 * @returns {Channel}
 */
ChannelManager.prototype.newChannel = function (token, channelName, accountName, replaceExisting) {
    var channel = this.GetByName(channelName);
    if (!channel) {
        this.Add(channel = new Channel(this._api, token, channelName, accountName));
    } else {
        if (replaceExisting) {
            channel.disconnect();
            this.Set(channelName.toLowerCase(), channel = new Channel(this._api, token, channelName, accountName));
        }
    }
    channel.connect();
    return channel;
};

/**
 * Gets a channel by it's name
 * @param {String} name
 * @returns {Channel}
 */
ChannelManager.prototype.GetByName = function (name) {
    return this.Get(name.toLowerCase());
};

module.exports = ChannelManager;