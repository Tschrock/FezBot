var api;

function handleMessage(data) {
    if (data.msg.toLowerCase().startsWith("!help")) {
        if (data.whisper || api.timeout_manager.checkTimeout(data.channel, "cmd.help")) {
            if (api["url"]) {
                sendMessage(data, "Bot Help: " + api.url.url + ":" + api.url.port + "/help", data.whisper);
            }
            else {
                sendMessage(data, "No halp available :(", data.whisper);
            }
        } else {
            sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.help") / 1000) + " sec. and try again.", true);
        }
    }
}

function isInt(value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
    })(parseFloat(value));
}

function sendMessage(uData, txt, whisper) {
    if (typeof whisper !== 'undefined' && whisper) {
        api.Messages.whisper(uData.username, txt, uData.channel);
    } else {
        api.Messages.send(txt, uData.channel);
    }
}

function servePage(req,res) {
    var path = req.url.split('/');
    if(path[1].toLowerCase() == "help"){        
        var plugins = api.plugin_manager.listLoadedPlugins();
        var commandhelp = [];
        
        for(var pluginFile in plugins) {
            plugin = api.plugin_manager.getPlugin(plugins[pluginFile]);
            if(plugin.meta_inf && plugin.meta_inf.commandhelp) {
                commandhelp.push({plugin: "<h4>" + (plugin.meta_inf.pluginurl ? "<a href=\"" + plugin.meta_inf.pluginurl + "\">" : "") + plugin.meta_inf.name + ":" + (plugin.meta_inf.pluginurl ? "</a>" : "") + "</h4>",command: "", usage: "", description: "", permission: ""});
                commandhelp = commandhelp.concat(plugin.meta_inf.commandhelp.map(function (x) {
                    var y = {};
                    y.plugin = "";
                    y.command = x.command;
                    y.usage = htmlEntities(x.usage);
                    y.description = x.description;
                    y.permission = x.permission;
                    return y;
                }));
            }
        }
        
        api.jade.renderFile(process.cwd() + '/views/list.jade',{listHeader: ["Plugin", "Command", "Usage", "Description", "PermissionId"], list: commandhelp, page: {title: "Command Help", subheader: "Command Help:", breadcrumb: [["/", "Home"], ["/help", "Command Help"]]}}, function(err,html){
            res.write(html);
        });
    } else {
        if(req.collection == null) req.collection = [];
        req.collection.push(["Help","/help/","Help for the bot."]);
    }
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = {
    meta_inf: {
        name: "Help",
        version: "1.0.0",
        description: "Shows help.",
        author: "Tschrock (CyberPon3)",
        pluginurl: "/help",
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