var api;
var storage;

var MessageTypes = require('../modules/messagetypes');
var BotEvent = require('../modules/botevent');
var CommandMessage = require('../modules/commandmessage');
var EventTypes = require('../modules/eventtypes');

function handleMessage(event) {
    var command = event.data;
    var commandAliases = storage.getItem("commands_" + command.channel.id) || {};

    if ((command.command === 'addalias' || command.command === 'setalias') && event.claim()) {
        if (!command.sender.hasPermission("cmd.addalias")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else {
            if (command.parameters.length === 2) {
                var alias = command.parameters[0].toLowerCase().replace(/^!/, '');
                commandAliases[alias] = command.parameters.slice(1).join(' ');
                storage.setItem("commands_" + command.channel.id, commandAliases);
                command.reply("Added '!" + alias + "' command.");
            } else {
                command.reply("Usage: !addalias <alias> <command...>");
            }
        }
    } else if ((command.command === 'delalias' || command.command === 'rmalias') && event.claim()) {
        if (!command.sender.hasPermission("cmd.delalias")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else {
            if (command.parameters.length === 1) {
                var alias = command.parameters[0].toLowerCase().replace(/^!/, '');
                delete commandAliases[alias];
                storage.setItem("commands_" + command.channel.id, commandAliases);
                command.reply("Removed '!" + alias + "' command.");
            } else {
                command.reply("Usage: !delalias <alias>");
            }
        }
    } else if (commandAliases[command.command] && event.claim()) {

        if (!command.sender.hasPermission("cmd." + command.command)) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType !== MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd." + command.command)) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd." + command.command));
        } else {
            
            var newCommand = Object.create(command);
            newCommand.content = commandAliases[command.command].replace('$args', command.parameters.slice(1).join(' '));
            newCommand = new CommandMessage(newCommand);
            var event = new BotEvent(event.type, event.source, newCommand);
            event.fromAlias = true;
            api.events.emit(event.type, event);
            
        }
    }
}

var pluginTitle = "Command Aliases";
var pluginUrl = "command_aliases";
var pluginUrlAbs = "/" + pluginUrl + "/";
var commands_regex = new RegExp("commands_.*");

function servePage(req, res) {
    var path = req.url.split('/');

    if (path.length > 2 && path[1].toLowerCase() === pluginUrl && path[2] !== '') {

        var cmds = storage.getItem("commands_" + path[2]) || false;
        if (cmds) {
            cmdMsgs = [];
            for (var cmd in cmds) {
                cmdMsgs.push({command: "!" + cmd, message: cmds[cmd]});
            }
            api.jade.renderFile(
                    process.cwd() + '/views/list.jade',
                    {
                        listHeader: ["Alias", "Command"],
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
            return commands_regex.test(x);
        }).map(function (x) {
            return {channel: x.replace("commands_", "")};
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
        name: pluginTitle,
        version: "1.0.0",
        description: "Allows to create command aliases",
        author: "Tschrock (CyberPon3)",
        pluginurl: pluginUrlAbs,
        commandhelp: [
            {command: "!addalias", usage: "!addalias <alias> <command...>", description: "Creates an alias for a command. Use '$args' to pass along the alias's arguments.", permission: "cmd.addalias"},
            {command: "!delalias", usage: "!delalias <alias>", description: "Removes an alias.", permission: "cmd.delalias"},
            {command: "!lsalias", usage: "!lsalias", description: "Lists all aliases.", permission: "cmd.addalias"}
        ]
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.events.on(EventTypes.CHATCOMMAND, handleMessage);
        api.events.on("http", servePage);
    },
    stop: function () {
        api.events.removeListener(EventTypes.CHATCOMMAND, handleMessage);
        api.events.removeListener("http", servePage);
    }
};