'use strict';

var NiceList = require('./nicelist');

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
 * Gets a channel by it's name
 * @param {String} name
 * @returns {Channel}
 */
ChannelManager.prototype.GetByName = function (name) {
    return this.Get(name.toLowerCase());
};

module.exports = ChannelManager;