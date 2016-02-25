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

        var commands = storage.getItem("commands") || {};

        if (cmd === '!addcmd' || cmd === '!setcmd') {
            if (api.permissions_manager.userHasPermission(data, "cmd.addcmd") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 2) {
                    commands[pars[1].toLowerCase().replace(/^!/, '')] = pars.slice(2).join(' ');
                    storage.setItem("commands", commands);
                } else {
                    sendMessage("Usage: !addcmd <command> <cmdmessage...>", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!delcmd') {
            if (api.permissions_manager.userHasPermission(data, "cmd.delcmd") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 1) {
                    delete commands[pars[1].toLowerCase().replace(/^!/, '')];
                    storage.setItem("commands", commands);
                } else {
                    sendMessage("Usage: !delcmd <command>", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!lscmd') {
            if (api.permissions_manager.userHasPermission(data, "cmd.lscmd") || api.permissions_manager.isOwner(data)) {
                var resp = "Saved Commands:\n  |  ";
                for (var msg in commands) {
                    resp += "!" + msg + " - " + commands[msg].substr(0, 20) + (commands[msg].length > 20 ? "..." : "") + "\n  |  ";
                }
                sendMessage(resp, whisper ? data.username : undefined);
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (typeof commands[cmd.replace(/^!/, '')] !== 'undefined') {
            msgcmd = cmd.replace(/^!/, '');
            if (api.timeout_manager.checkTimeout("cmd." + msgcmd, 20000) || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd." + msgcmd)) {
                if (api.permissions_manager.userHasPermission(data, "cmd." + msgcmd) || api.permissions_manager.isOwner(data)) {
                    data.msg = commands[cmd.replace(/^!/, '')].replace('$args', pars.slice(1).join(' '));
                    data.id += '_';
                    api.Events.emit("userMsg", api.user_manager.updateUserData(data));
                } else {
                    sendMessage("Sorry, you don't have permission to use this command.", data.username);
                }
            } else {
                sendMessage("Too soon, wait another " + api.timeout_manager.getTimeoutRemaining("cmd." + msgcmd) / 1000 + " sec. and try again (or whisper me).", data.username);
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
        name: "Command Aliases",
        version: "1.0.0",
        description: "Allows to create command aliases",
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