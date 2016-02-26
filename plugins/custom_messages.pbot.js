var api;
var storage;

function handleMessage(data) {
    if (data.msg.startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();

        var messages = storage.getItem("messages") || {};

        if (cmd === '!addmsg' || cmd === '!setmsg') {
            if (api.permissions_manager.userHasPermission(data, "cmd.addmsg") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 2) {
                    messages[pars[1].toLowerCase().replace(/^!/, '')] = pars.slice(2).join(' ');
                    storage.setItem("messages", messages);
                } else {
                    sendMessage(data, "Usage: !addmsg <command> <message...>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!delmsg') {
            if (api.permissions_manager.userHasPermission(data, "cmd.delmsg") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 1) {
                    delete messages[pars[1].toLowerCase().replace(/^!/, '')];
                    storage.setItem("messages", messages);
                } else {
                    sendMessage(data, "Usage: !delmsg <command>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!lsmsg') {
            if (api.permissions_manager.userHasPermission(data, "cmd.lsmsg") || api.permissions_manager.isOwner(data)) {
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
            if (api.timeout_manager.checkTimeout("cmd." + msgcmd, 20000) || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd." + msgcmd)) {
                if (api.permissions_manager.userHasPermission(data, "cmd." + msgcmd) || api.permissions_manager.isOwner(data)) {
                    sendMessage(data, messages[cmd.replace(/^!/, '')], data.whisper);
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }
            } else {
                sendMessage(data, "Too soon, wait another " + api.timeout_manager.getTimeoutRemaining("cmd." + msgcmd) / 1000 + " sec. and try again (or whisper me).", true);
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

module.exports = {
    meta_inf: {
        name: "Custom notes",
        version: "1.0.0",
        description: "Allows to save and view notes",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", handleMessage);
        api.Events.on("whisper", handleMessage);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMessage);
        api.Events.removeListener("whisper", handleMessage);
    }
}