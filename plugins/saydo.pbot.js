var api;

function checkCommand(command, person, isWhisper, defaultTimeoutMs, defaultCmdPermission) {
    if (isWhisper || checkTimeout("cmd." + command, defaultTimeoutMs) || userHasPermission(person, "timeoutbypass.global") || userHasPermission(person, "timeoutbypass.cmd." + command)) {
        if (userHasPermission(person, "cmd." + command, defaultCmdPermission) || isOwner(person)) {
            return true;
        } else {
            sendMessage("Sorry, you don't have permission to use this command.", person.username);
        }
    } else {
        sendMessage("Too soon, wait another " + getTimeoutRemaining("command." + command) / 1000 + " sec. and try again (or whisper me).", person.username);
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
        if (cmd === '!sudo' && pars.length > 2) {
            if (api.permissions_manager.userHasPermission(data, "cmd.sudo") || api.permissions_manager.isOwner(data)) {
                api.Events.emit("userMsg", api.user_manager.updateUserData({username: pars[1], msg: pars.slice(2).join(' ')}));
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!say' && pars.length > 1) {
            if (api.permissions_manager.userHasPermission(data, "cmd.say") || api.permissions_manager.isOwner(data)) {
                sendMessage(pars.slice(1).join(' '));
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!whisper' && pars.length > 2) {
            if (api.permissions_manager.userHasPermission(data, "cmd.whisper") || api.permissions_manager.isOwner(data)) {
                sendMessage(pars.slice(2).join(' '), pars[1]);
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!unwhisper' && pars.length > 1) {
            if (api.permissions_manager.userHasPermission(data, "cmd.unwhisper") || api.permissions_manager.isOwner(data)) {
                data.msg = pars.slice(1).join(' ');
                data.id += '_';
                api.Events.emit("userMsg", api.user_manager.updateUserData(data));
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
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
        name: "Saydo",
        version: "1.0.0",
        description: "Commands to say/do things as the bot.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
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