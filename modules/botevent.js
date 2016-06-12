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
    /**
     * The type of event
     * @type String
     */
    this.type = type;
    /**
     * The source of the event
     * @type Object
     */
    this.source = source;
    /**
     * The data of the event
     * @type Object
     */
    this.data = data;
    /**
     * Whether or not the event has been claimed
     * @type Boolean
     */
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