var api;
var storage;

function handleMsg(data) {
    if (!data.msg.toLowerCase().startsWith("!") && !api.user_manager.isBot(data)) {
        if (data.msg.toLowerCase().indexOf("skittle") !== -1 && api.timeout_manager.checkTimeout(data.channel, "trigger.skittle", 60000)) {
            api.Messages.send("TASTE THE RAINBOW!", data.channel);

        } else if (data.msg.toLowerCase().indexOf("boop") !== -1) {
            var msgs = storage.getItem("boops") || 0;
            msgs++;
            storage.setItem("boops", msgs);
            if (api.botName[data.channel.toLowerCase()] && data.msg.toLowerCase().indexOf("boops " + api.botName[data.channel.toLowerCase()].toLowerCase()) !== -1) {
                api.Messages.send("\me boops " + data.username, data.channel);
            }
            else if (api.timeout_manager.checkTimeout(data.channel, "trigger.boop", 20000)) {
                api.Messages.send("boop", data.channel);
            }

        } else if (data.msg.toLowerCase().indexOf("wake me up inside") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.wakemeup", 60000)) {
                api.Messages.send("♫ Save me from the nothing I've become. ♫", data.channel);
            }
        }
        else if(data.msg.toLowerCase().indexOf("you spin me right round baby right round") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.spinme", 60000)) {
                api.Messages.send("♫ Like a record, baby, Right round round round ♫", data.channel);
            }
        }
    }
    if (data.msg.toLowerCase().startsWith("!boops")) {
        if (api.timeout_manager.checkTimeout(data.channel, "cmd.boops")) {
            api.Messages.send("Chat has been booped " + (storage.getItem("boops") || 0) + " times", data.channel);
        } else {
            sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.boops") / 1000) + " sec. and try again.", true);
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
        name: "textCatcher",
        version: "1.0.0",
        description: "Does stuff",
        author: "Tschrock (CyberPon3)",
        storage_options: {
            interval: 5000
        }
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", handleMsg);
        api.Events.on("meMsg", handleMsg);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMsg);
        api.Events.removeListener("meMsg", handleMsg);
    }
}
