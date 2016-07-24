'use strict';

var api;
var storage;

var PicartoChatProvider = {
    Channel: require('./ChatProvider_Picarto/channel'),
    ConnectOptions: {
        account: {
            name: "Picarto Account",
            description: "The Picarto account the bot should use.",
            flag: "-a",
            required: true
        },
        password: {
            name: "Account Password",
            description: "The password for the bot's Picarto account",
            flag: "-p",
            required: false,
            alternative: "token"
        },
        channel: {
            name: "Channel",
            description: "The channel the bot should join.",
            flag: "-c",
            alternative: "token",
            unique: true
        },
        token: {
            name: "Token",
            description: "The auth token for the chat socket.",
            flag: "-t"
        }
    }
};


module.exports = {
    meta_inf: {
        name: 'Picarto Chat Provider',
        version: "1.0.0",
        description: "Provides a chat interface to Picarto.tv",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.registerChatProvider('picarto', PicartoChatProvider);
    },
    stop: function () {
        api.deregisterChatProvider('picarto', PicartoChatProvider);
    }
};