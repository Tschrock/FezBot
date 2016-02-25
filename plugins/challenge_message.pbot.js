var api;
var storage;

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}
function handleMessage(data, whisper) {
    if (data.msg.toLowerCase().startsWith("!contest") ||
            data.msg.toLowerCase().startsWith("!competition") ||
            data.msg.toLowerCase().startsWith("!challenge")) {
        if (whisper) {
            sendMessage(storage.getItem("challenge") || "Use !setchallenge to set this message.", whisper ? data.username : undefined);
        } else {
            if (api.timeout_manager.checkTimeout("cmd.challenge")) {
                sendMessage(storage.getItem("challenge") || "Use !setchallenge to set this message.", whisper ? data.username : undefined);
            } else {
                sendMessage("Too soon, wait another " + getTimeoutRemaining(0) / 1000 + " sec. and try again (or whisper me).", data.username);
            }
        }
    }
    if (data.msg.toLowerCase().startsWith("!setcontest") ||
            data.msg.toLowerCase().startsWith("!setcompetition") ||
            data.msg.toLowerCase().startsWith("!setchallenge")) {

        if (api.permissions_manager.userHasPermission(data, "cmd.setchallenge") || api.permissions_manager.isOwner(data)) {
            api.timeout_manager.clearTimeout("cmd.challenge")
            msgArr = data.msg.split(' ');
            storage.setItem("challenge", msgArr.slice(1).join(' '));
            sendMessage("Set challenge.", data.username);
        } else {
            sendMessage("Sorry, you don't have permission to use this command.", data.username);
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
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}