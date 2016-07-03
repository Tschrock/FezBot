var api;
var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'mute' && event.claim()) {
        if (!command.sender.hasPermission("cmd.mute", PermissionLevels.PERMISSION_ALL)) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.mute")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.mute"));
        } else {
            command.reply("Goodbye...");
            command.channel.mute();
        }
    }
    else if (command.command === 'unmute' && event.claim()) {
        if (!command.sender.hasPermission("cmd.unmute", PermissionLevels.PERMISSION_ALL)) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.unmute")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.unmute"));
        } else {
            command.channel.unmute();
            command.reply("Hello!");
        }
    }
}

module.exports = {
    meta_inf: {
        name: "Mute",
        version: "1.0.0",
        description: "Allows Streamers and Global Admins to mute the bot",
        author: "Amm",
        commandhelp: [
            {command: "!mute", usage: "!mute", description: "Mutes the bot.", permission: "cmd.mute"},
            {command: "!unmute", usage: "!unmute", description: "Unmutes the bot.", permission: "cmd.mute"}
        ]
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.events.on("chatCommand", handleCommand);
        api.events.on("consoleCommand", handleCommand);
    },
    stop: function () {
        api.events.removeListener("chatCommand", handleCommand);
        api.events.removeListener("consoleCommand", handleCommand);
    }
};
