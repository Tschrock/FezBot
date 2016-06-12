'use strict';

/**
 * Types of messages that can be sent or recieved
 * @enum {Integer}
 */
var MessageType = {
    SYSTEM: 0,
    PRIVATE: 1,
    GENERIC: 2,
    SELF: 3
};

module.exports = MessageType;