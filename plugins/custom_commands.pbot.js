var api;
var storage;
var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    var pars = command.parameters;
    var messages = storage.getItem("messages_" + command.channel.channelName) || {};

    if (command.command === 'setcmd' && event.claim()) {
        if (!command.sender.hasPermission("cmd.setcmd")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.setcmd")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.setcmd"));
        } else {
            if (pars.length > 1) {
                var msgcmd = pars[0].toLowerCase().replace(/^!/, '');
                var msg = pars.slice(1).join(' ');
                messages[msgcmd] = msg;
                storage.setItem("messages_" + command.channel.channelName, messages);
                command.reply("Set command !" + msgcmd + " to '" + msg.substr(0, 30) + (msg.length > 30 ? "..." : "") + "'");
            } else {
                command.replyPrivate("Usage: !setcmd <command> <message...>");
            }
        }
    } else if (command.command === 'delcmd' && event.claim()) {
        if (!command.sender.hasPermission("cmd.delcmd")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.delcmd")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.delcmd"));
        } else {
            if (pars.length > 0) {
                delete messages[pars[0].toLowerCase().replace(/^!/, '')];
                storage.setItem("messages_" + command.channel.channelName, messages);
                command.reply("Removed command !" + pars[1].toLowerCase().replace(/^!/, ''));
            } else {
                command.replyPrivate("Usage: !delcmd <command>");
            }
        }
    } else if (command.command === 'lscmd' && event.claim()) {
        if (!command.sender.hasPermission("cmd.lscmd")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.lscmd")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.lscmd"));
        } else {
            if (api["url"]) {
                command.reply("Command List: " + api.url.url + ":" + api.url.port + "/custom_commands");
            } else {
                command.reply("No list available :(");
            }
        }
    } else if (typeof messages[command.command.replace(/^!/, '')] !== 'undefined' && event.claim()) {
        var cmd = command.command;
        var msgcmd = cmd.replace(/^!/, '');
        if (!command.sender.hasPermission("cmd." + msgcmd, PermissionLevels.PERMISSION_ALL)) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd." + msgcmd)) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd." + msgcmd));
        } else {
            command.reply(messages[cmd.replace(/^!/, '')].replace('$args', command.parameters.join(' ')));    
        }
    }
}

var pluginTitle = "Custom Commands";
var pluginUrl = "custom_commands";
var pluginUrlAbs = "/" + pluginUrl + "/";
var messages_regex = new RegExp("messages_.*");

function servePage(req, res) {
    var path = req.url.split('/');

    if (path.length > 2 && path[1].toLowerCase() == pluginUrl && path[2] != '') {

        var cmds = storage.getItem("messages_" + path[2]) || false;
        if (cmds) {
            cmdMsgs = [];
            for (var cmd in cmds) {
                cmdMsgs.push({command: "!" + cmd, message: cmds[cmd]});
            }
            api.jade.renderFile(
                    process.cwd() + '/views/list.jade',
                    {
                        listHeader: ["Command", "Message"],
                        list: cmdMsgs,
                        page: {
                            title: path[2] + " " + pluginTitle,
                            subheader: path[2] + "'s " + pluginTitle + ":",
                            breadcrumb: [
                                ["/", "Home"],
                                [pluginUrlAbs, pluginTitle],
                                ["", path[2]]
                            ]
                        }
                    },
                    function (err, html) {
                        res.write(html);
                    }
            );
        } else {
            api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                res.write(html);
            });
        }
    } else if (path[1].toLowerCase() === pluginUrl) {

        var channels = storage.keys().filter(function (x) {
            return messages_regex.test(x);
        }).map(function (x) {
            return {channel: x.replace("messages_", "")};
        });

        api.jade.renderFile(
                process.cwd() + '/views/channels.jade',
                {
                    url: pluginUrlAbs,
                    channels: channels,
                    page: {
                        title: pluginTitle,
                        breadcrumb: [
                            ["/", "Home"],
                            [pluginUrlAbs, pluginTitle]
                        ]
                    }
                },
                function (err, html) {
                    res.write(html);
                });
    } else {
        if (req.collection == null)
            req.collection = [];
        req.collection.push([pluginTitle, pluginUrlAbs, pluginTitle]);
    }
}

module.exports = {
    meta_inf: {
        name: "Custom Commands",
        version: "1.0.0",
        description: "Create commands to say premade messages.",
        author: "Tschrock (CyberPon3)",
        pluginurl: "/custom_commands",
        commandhelp: [
            {command: "!setcmd", usage: "!setcmd <command> <message...>", description: "Adds a command that says a message.", permission: "cmd.addcmd"},
            {command: "!delcmd", usage: "!delcmd <command>", description: "Removes a message command..", permission: "cmd.delcmd"},
            {command: "!lscmd", usage: "!lscmd", description: "Lists message commands.", permission: "cmd.lscmd"}
        ]
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.events.on("chatCommand", handleCommand);
        api.events.on("consoleCommand", handleCommand);
        api.events.on("http", servePage);
    },
    stop: function () {
        api.events.removeListener("chatCommand", handleCommand);
        api.events.removeListener("consoleCommand", handleCommand);
        api.events.removeListener("http", servePage);
    }
}