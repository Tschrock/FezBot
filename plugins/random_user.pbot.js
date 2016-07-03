var api;

var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'random' && event.claim()) {
        if (!command.sender.hasPermission("cmd.random")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");

        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.random")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.random"));
        } else {
            var users = command.channel.onlineUsers.Where(function (u) {
                return !u.extraData.banned;
            }).Where(function (user) {
                return user.hasPermission("cmd.random.include", PermissionLevels.PERMISSION_ALL);
            });

            if (users.Count() > 0) {
                command.reply("Random user: *[" + users.Random().username + "]");
            } else {
                command.reply("Couldn't find any users :(");
            }
        }
    }
}

module.exports = {
    meta_inf: {
        name: "Random User",
        version: "1.0.0",
        description: "Gets a random user.",
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!random", usage: "!random", description: "Gets a random user in chat.", permission: "cmd.random"}
        ]
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.events.on("chatCommand", handleCommand);
    },
    stop: function () {
        api.events.removeListener("chatCommand", handleCommand);
    }
};