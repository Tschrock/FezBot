var api;
var storage;

function handleMsg(data) {
    if (!data.msg.toLowerCase().startsWith("!") && data.username.toLowerCase() !== api.name.toLowerCase()) {
        if (data.msg.toLowerCase().indexOf("skittle") !== -1 && api.timeout_manager.checkTimeout("trigger.skittle", 60000)) {
            api.Messages.send("TASTE THE RAINBOW!");

        } else if (data.msg.toLowerCase().indexOf("boop") !== -1) {
            var msgs = storage.getItem("boops") || 0;
            msgs++;
            storage.setItem("boops", msgs);
            if (api.timeout_manager.checkTimeout("trigger.boop", 20000)) {
                api.Messages.send("boop");
            }

        } else if (data.msg.toLowerCase().indexOf("wake me up inside") !== -1) {
            if (api.timeout_manager.checkTimeout("trigger.wakemeup", 60000)) {
                api.Messages.send("♫ Save me from the nothing I've become. ♫");
            }
        }
    }
    if (data.msg.toLowerCase().startsWith("!boops")) {
        if (api.timeout_manager.checkTimeout("cmd.boops")) {
            api.Messages.send("Chat has been booped " + (storage.getItem("boops") || 0) + " times");
        } else {
            sendMessage("Too soon, wait another " + (api.timeout_manager.getTimeRemaining("cmd.boops") / 1000) + " sec. and try again.", data.username);
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
        name: "textCatcher",
        version: "1.0.0",
        description: "Does stuff",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", handleMsg);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMsg);
    }
}
