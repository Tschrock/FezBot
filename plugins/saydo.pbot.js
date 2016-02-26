var api;

function handleMessage(data) {
    if (data.msg.startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();
        if (cmd === '!sudo' && pars.length > 2) {
            if (api.permissions_manager.userHasPermission(data, "cmd.sudo") || api.permissions_manager.isOwner(data)) {
                api.Events.emit("userMsg", api.user_manager.updateUserData({username: pars[1], msg: pars.slice(2).join(' ')}));
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!say' && pars.length > 1) {
            if (api.permissions_manager.userHasPermission(data, "cmd.say") || api.permissions_manager.isOwner(data)) {
                sendMessage(data, pars.slice(1).join(' '));
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!whisper' && pars.length > 2) {
            if (api.permissions_manager.userHasPermission(data, "cmd.whisper") || api.permissions_manager.isOwner(data)) {
                api.Messages.whisper(pars[1], pars.slice(2).join(' '), data.channel);
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

        } else if (cmd === '!unwhisper' && pars.length > 1) {
            if (api.permissions_manager.userHasPermission(data, "cmd.unwhisper") || api.permissions_manager.isOwner(data)) {
                data.msg = pars.slice(1).join(' ');
                data.id += '_';
                api.Events.emit("userMsg", api.user_manager.updateUserData(data));
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
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
        name: "Saydo",
        version: "1.0.0",
        description: "Commands to say/do things as the bot.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
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