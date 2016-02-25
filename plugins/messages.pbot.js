var api;
var storage;

function checkCommand(command, person, isWhisper, defaultTimeoutMs, defaultCmdPermission) {
    if (isWhisper || api.timeout_manager.checkTimeout("cmd." + command, defaultTimeoutMs) || api.permissions_manager.userHasPermission(person, "timeoutbypass.global") || api.permissions_manager.userHasPermission(person, "timeoutbypass.cmd." + command)) {
        if (api.permissions_manager.userHasPermission(person, "cmd." + command, defaultCmdPermission) || api.permissions_manager.isOwner(person)) {
            return true;
        } else {
            sendMessage("Sorry, you don't have permission to use this command.", person.username);
        }
    } else {
        sendMessage("Too soon, wait another " + api.timeout_manager.getTimeoutRemaining("command." + command) / 1000 + " sec. and try again (or whisper me).", person.username);
    }
    return false;
}

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}
function handleMessage(data, whisper) {
    if (data.msg.startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();

        var messages = storage.getItem("messages") || {};

        if (cmd === '!addmsg' && pars.length > 3) {
            if (api.permissions_manager.userHasPermission(data, "cmd.addmsg") || api.permissions_manager.isOwner(data)) {
                messages[pars[1].toLowerCase().replace(/^!/, '')] = pars.slice(2).join(' ');
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!delmsg' && pars.length > 2) {
            if (api.permissions_manager.userHasPermission(data, "cmd.delmsg") || api.permissions_manager.isOwner(data)) {
                delete messages[pars[1].toLowerCase()];
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!lsmsg') {
            if (api.permissions_manager.userHasPermission(data, "cmd.lsmsg") || api.permissions_manager.isOwner(data)) {
                var resp = "Saved Messages:";
                for (var msg in messages) {
                    resp = "!" + msg + " - " + messages[msg].substr(0, 30) + (messages[msg].length > 30 ? "..." : "") + "\n";
                }
                sendMessage(resp, whisper ? data.username : undefined);
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (typeof messages[cmd.replace(/^!/, '')] !== 'undefined') {
            msgcmd = cmd.replace(/^!/, '');
            if (api.timeout_manager.checkTimeout("cmd." + msgcmd, 20000)) {
                if (api.permissions_manager.userHasPermission(data, "cmd." + msgcmd) || api.permissions_manager.isOwner(data)) {
                    sendMessage(messages[cmd.replace(/^!/, '')], whisper ? data.username : undefined);
                } else {
                    sendMessage("Sorry, you don't have permission to use this command.", data.username);
                }
            } else {
                sendMessage("Too soon, wait another " + getTimeoutRemaining("cmd." + msgcmd) / 1000 + " sec. and try again (or whisper me).", data.username);
            }
        }
    }
}

function sendMessage(txt, whisperUser) {
    if (typeof whisperUser !== 'undefined') {
        api.Messages.whisper(whisperUser, txt);
    } else {
        api.Messages.send(txt);
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
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}