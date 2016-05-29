var api;

function handleMessage(data) {
    if (data.msg.toLowerCase().split(' ')[0] === "!help") {
        if (data.whisper || api.timeout_manager.checkTimeout(data.channel, "cmd.help", 20000) || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd.help")) {
            if (api.permissions_manager.userHasPermission(data, "cmd.help", api.permissions.PERMISSION_ALL) || api.permissions_manager.isOwner(data)) {
                if (api["url"]) {
                    sendMessage(data, "Bot Help: " + api.url.url + ":" + api.url.port + "/help", data.whisper);
                } else {
                    sendMessage(data, "No halp available :(", data.whisper);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }
        } else {
            sendMessage(data, "Too soon, wait another " + api.timeout_manager.getTimeRemaining(data.channel, "cmd." + msgcmd) / 1000 + " sec. and try again (or whisper me).", true);
        }
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sendMessage(uData, txt, whisper) {
    if (typeof whisper !== 'undefined' && whisper) {
        api.Messages.whisper(uData.username, txt, uData.channel);
    } else {
        api.Messages.send(txt, uData.channel);
    }
}

var pluginTitle = "Help";
var pluginUrl = "help";
var pluginUrlAbs = "/" + pluginUrl;

function servePage(req, res) {
    var path = req.url.split('/');
    if (path[1].toLowerCase() === pluginUrl) {
        var commandhelp = [];

        var plugins = api.plugin_manager.listLoadedPlugins();
        for (var pluginFile in plugins) {
            plugin = api.plugin_manager.getPlugin(plugins[pluginFile]);
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
        api.Events.on("userMsg", handleMessage);
        api.Events.on("whisper", handleMessage);
        api.Events.on("http", servePage);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMessage);
        api.Events.removeListener("whisper", handleMessage);
        api.Events.removeListener("http", servePage);
    }
}