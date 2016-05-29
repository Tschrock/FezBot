'use strict';

var NiceList = require('./nicelist');

var ChannelManager = function (api) {
    this._api = api;
};
ChannelManager.prototype = Object.create(NiceList.prototype);
ChannelManager.prototype.constructor = NiceList;


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
ChannelManager.prototype.GetByName = function (name) {
    return this.Get(name.toLowerCase());
};

module.exports = ChannelManager;