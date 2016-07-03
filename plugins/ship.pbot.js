var api;

var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'ship' && event.claim()) {
        if (!command.sender.hasPermission("cmd.ship")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");

        } else if (command.messageType !== MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.ship")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.ship"));

        } else {

            var users = command.channel.onlineUsers.Where(function (u) {
                return !u.extraData.banned;
            }).Where(function (user) {
                return user.hasPermission("cmd.random.include", PermissionLevels.PERMISSION_ALL);
            });

            if (users.Count() > 0) {
                if (command.parameters.length > 0) {
                    command.reply(command.parameters.slice(1).join(' ') + " ❤ " + users.Random().username);
                } else {
                    command.reply(users.Random().username + " ❤ " + users.Random().username);
                }
            } else {
                command.reply("Error getting random user from list!");
                console.log("Error getting random user from list!");
                console.log(users);
            }
        }
    }
}

module.exports = {
    meta_inf: {
        name: "Shipping",
        version: "1.0.0",
        description: "Ships 2 random users.",
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!ship", usage: "!ship", description: "Ships 2 random users in chat.", permission: "cmd.ship"},
            {command: "!ship", usage: "!ship <something...>", description: "Ships something with a random user in chat.", permission: "cmd.ship"}
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