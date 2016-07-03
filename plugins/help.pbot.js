var api;

var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'help' && event.claim()) {
        if (!command.sender.hasPermission("cmd.help", PermissionLevels.PERMISSION_ALL)) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");

        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.help")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.help"));
        } else {
            if (api["url"]) {
                command.reply("Bot Help: " + api.url.url + ":" + api.url.port + "/help");
            } else {
                command.reply("No halp available :(");
            }
        }
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var pluginTitle = "Help";
var pluginUrl = "help";
var pluginUrlAbs = "/" + pluginUrl;

function servePage(req, res) {
    var path = req.url.split('/');
    if (path[1].toLowerCase() === pluginUrl) {
        var commandhelp = [];

        var plugins = api.pluginLoader.getLoadedPlugins();
        for (var pluginFile in plugins) {
            plugin = api.pluginLoader.getPlugin(plugins[pluginFile]);
            if (plugin.meta_inf && plugin.meta_inf.commandhelp) {
                commandhelp.push({
                    plugin: "<h4>" + (plugin.meta_inf.pluginurl ? "<a href=\"" + plugin.meta_inf.pluginurl + "\">" : "") + plugin.meta_inf.name + ":" + (plugin.meta_inf.pluginurl ? "</a>" : "") + "</h4>",
                    command: "",
                    usage: "",
                    description: "",
                    permission: ""
                });
                commandhelp = commandhelp.concat(plugin.meta_inf.commandhelp.map(function (x) {
                    return {
                        plugin: "",
                        command: x.command,
                        usage: htmlEntities(x.usage),
                        description: x.description,
                        permission: x.permission
                    };
                }));
            }
        }

        api.jade.renderFile(
                process.cwd() + '/views/list.jade',
                {
                    listHeader: ["Plugin", "Command", "Usage", "Description", "PermissionId"],
                    list: commandhelp,
                    page: {
                        title: "Command Help",
                        subheader: "Command Help:",
                        breadcrumb: [
                            ["/", "Home"],
                            [pluginUrlAbs, "Command Help"]
                        ]
                    }
                },
                function (err, html) {
                    res.write(html);
                });
    } else {
        if (req.collection == null)
            req.collection = [];
        req.collection.push([pluginTitle, pluginUrlAbs, "Help for the bot."]);
    }
}

module.exports = {
    meta_inf: {
        name: pluginTitle,
        version: "1.0.0",
        description: "Shows help.",
        author: "Tschrock (CyberPon3)",
        pluginurl: pluginUrlAbs,
        commandhelp: [
            {command: "!help", usage: "!help", description: "Posts a link to the bot's help.", permission: "cmd.help"}
        ]
    },
    load: function (_api) {
        api = _api;
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
};