'use strict';

/**
 * A bot event
 * @constructor
 * @param {String} type
 * @param {Object} source
 * @param {Object} data
 * @returns {BotEvent}
 */
var BotEvent = function (type, source, data) {
    this.type = type;
    this.source = source;
    this.data = data;
    this.claimed = false;
};
/**
 * Attempts to claim an event
 * @returns {Boolean} Whether or not the event was successfuly claimed
 */
BotEvent.prototype.claim = function () {
    return this.claimed ? false : this.claimed = true;
};

module.exports = BotEvent;