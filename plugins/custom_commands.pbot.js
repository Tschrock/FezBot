var api;
var storage;

function handleMessage(data) {
    if (data.msg.startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();

        var messages = storage.getItem("messages_" + data.channel) || {};

        if (cmd === '!addcmd' || cmd === '!setcmd') {
            if (api.permissions_manager.userHasPermission(data, "cmd.addcmd") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 2) {
                    messages[pars[1].toLowerCase().replace(/^!/, '')] = pars.slice(2).join(' ');
                    storage.setItem("messages_" + data.channel, messages);
                } else {
                    sendMessage(data, "Usage: !addcmd <command> <message...>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!delcmd') {
            if (api.permissions_manager.userHasPermission(data, "cmd.delcmd") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 1) {
                    delete messages[pars[1].toLowerCase().replace(/^!/, '')];
                    storage.setItem("messages_" + data.channel, messages);
                } else {
                    sendMessage(data, "Usage: !delcmd <command>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!lscmd') {
            if (api.permissions_manager.userHasPermission(data, "cmd.lscmd") || api.permissions_manager.isOwner(data)) {
                var resp = "Saved Messages:\n  |  ";
                for (var msg in messages) {
                    resp += "!" + msg + " - " + messages[msg].substr(0, 20) + (messages[msg].length > 20 ? "..." : "") + "\n  |  ";
                }
                sendMessage(data, resp, data.whisper);
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (typeof messages[cmd.replace(/^!/, '')] !== 'undefined') {
            msgcmd = cmd.replace(/^!/, '');
            if (data.whisper || api.timeout_manager.checkTimeout(data.channel, "cmd." + msgcmd, 20000) || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd." + msgcmd)) {
                if (api.permissions_manager.userHasPermission(data, "cmd." + msgcmd, api.permissions_manager.PERMISSION_ADMIN | api.permissions_manager.PERMISSION_MOD | api.permissions_manager.PERMISSION_PTVADMIN | api.permissions_manager.PERMISSION_USER) || api.permissions_manager.isOwner(data)) {
                    sendMessage(data, messages[cmd.replace(/^!/, '')], data.whisper);
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }
            } else {
                sendMessage(data, "Too soon, wait another " + api.timeout_manager.getTimeRemaining(data.channel, "cmd." + msgcmd) / 1000 + " sec. and try again (or whisper me).", true);
            }
        }
    }
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
    
    if(path.length > 2 && path[1].toLowerCase() == "custom_commands" && path[2] != ''){
        
        var cmds = storage.getItem("messages_" + path[2]) || false;
        if(cmds){
            cmdMsgs = [];
            for(var cmd in cmds) {
                cmdMsgs.push({command: "!" + cmd, message: cmds[cmd]});
            }
            api.jade.renderFile(process.cwd() + '/views/list.jade',{listHeader: ["Command", "Message"], list: cmdMsgs, page: {title: path[2] + " Custom Commands", subheader: path[2] + "'s Commands:", breadcrumb: [["/", "Home"], ["/custom_commands", "Custom Commands"], ["", path[2]]]}}, function(err,html){
                res.write(html);
            });
        } else {
            api.jade.renderFile(process.cwd() + '/views/404.jade',null, function(err,html){
                res.write(html);
            });
        }
    } else if(path[1].toLowerCase() == "custom_commands"){
        
        var regex = new RegExp("messages_.*");
        var channels = storage.keys().filter(function (x) { return regex.test(x); }).map(function (x) { return {channel: x.replace("messages_", "")}; });
        
        api.jade.renderFile(process.cwd() + '/views/channels.jade',{url: '/custom_commands/', channels: channels, page: {title: "Custom Commands", breadcrumb: [["/", "Home"], ["/custom_commands", "Custom Commands"]]}}, function(err,html){
            res.write(html);
        });
    } else {
        if(req.collection == null) req.collection = [];
        req.collection.push(["Custom Commands","/custom_commands/","Custom Commands."]);
    }
}

module.exports = {
    meta_inf: {
        name: "Custom Commands",
        version: "1.0.0",
        description: "Create commands to say premade messages.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
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