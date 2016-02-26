var api;
var storage;

function handleMessage(data) {
    if (data.msg.toLowerCase().startsWith("!contest") ||
            data.msg.toLowerCase().startsWith("!competition") ||
            data.msg.toLowerCase().startsWith("!challenge")) {
        if (data.whisper) {
            sendMessage(data, storage.getItem("challenge") || "Use !setchallenge to set this message.", true);
        } else {
            if (api.timeout_manager.checkTimeout("cmd.challenge")) {
                sendMessage(data, storage.getItem("challenge") || "Use !setchallenge to set this message.", data.whisper);
            } else {
                sendMessage(data, "Too soon, wait another " + api.timeout_manager.getTimeoutRemaining("cmd.challenge") / 1000 + " sec. and try again (or whisper me).", true);
            }
        }
    }
    if (data.msg.toLowerCase().startsWith("!setcontest") ||
            data.msg.toLowerCase().startsWith("!setcompetition") ||
            data.msg.toLowerCase().startsWith("!setchallenge")) {

        if (api.permissions_manager.userHasPermission(data, "cmd.setchallenge") || api.permissions_manager.isOwner(data)) {
            api.timeout_manager.clearTimeout("cmd.challenge");
            msgArr = data.msg.split(' ');
            storage.setItem("challenge", msgArr.slice(1).join(' '));
            sendMessage(data, "Set challenge.", data.whisper);
        } else {
            sendMessage(data, "Sorry, you don't have permission to use this command.", true);
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
        name: "Challenge Message",
        version: "1.0.0",
        description: "Allows to set and show a Challenge message.",
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