var api;
var storage;

function handleMsg(data) {
    if (!data.msg.toLowerCase().startsWith("!") && !api.user_manager.isBot(data)) {

        msgLower = data.msg.toLowerCase();

        if (msgLower.indexOf("skittle") !== -1 && api.timeout_manager.checkTimeout(data.channel, "trigger.skittle", 60000)) {
            api.Messages.send("TASTE THE RAINBOW!", data.channel);

        } else if (msgLower.indexOf("boop") !== -1) {
            var msgs = storage.getItem("boops") || 0;
            msgs++;
            storage.setItem("boops", msgs);
            if (api.botName[data.channel.toLowerCase()] && msgLower.indexOf("boops " + api.botName[data.channel.toLowerCase()].toLowerCase()) !== -1) {
                api.Messages.send("/me boops " + data.username, data.channel);
            } else if (api.timeout_manager.checkTimeout(data.channel, "trigger.boop", 30000)) {
                api.Messages.send("boop", data.channel);
            }

        } else if (/butt($|z|s|[^a-z])/gi.test(msgLower)
                || msgLower.indexOf("flank") !== -1
                || msgLower.indexOf("booties") !== -1
                || msgLower.indexOf("booty") !== -1) {
            var msgs = storage.getItem("butts") || 0;
            msgs++;
            storage.setItem("butts", msgs);
        } else if (msgLower.indexOf("wake me up inside") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.wakemeup", 60000)) {
                api.Messages.send("♫ Save me from the nothing I've become. ♫", data.channel);
            }
        } else if (msgLower.indexOf("you spin me right round baby right round") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.spinme", 60000)) {
                api.Messages.send("♫ Like a record, baby, Right round round round ♫", data.channel);
            }
        } else if (msgLower.indexOf("never gonna give you up") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.rickroll", 60000)) {
                api.Messages.send("♫ Never gonna let you down!♫ ", data.channel);
            }
        } else if (data.msg.indexOf("youtube.com/watch?v=dQw4w9WgXcQ") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.rickroll2", 40000)) {
                api.Messages.send("You can't Rick-Roll me that easily!", data.channel);
            }
        } else if (msgLower.indexOf("it's too late to apologize") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.toolate", 40000)) {
                api.Messages.send("♫ it's too late ♫", data.channel);
            }
        } else if (msgLower.indexOf("i saw the sign") !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.thesign", 40000)) {
                api.Messages.send("♫ and it opened up my eyes I saw the sign ♫", data.channel);
            }
        } else if (msgLower.indexOf("kill " + api.botName[data.channel.toLowerCase()].toLowerCase()) !== -1
                || msgLower.indexOf("die " + api.botName[data.channel.toLowerCase()].toLowerCase()) !== -1) {
            if (api.timeout_manager.checkTimeout(data.channel, "trigger.die", 40000)) {
                api.Messages.send("Help, Cyber! They're trying to hurt me!", data.channel);
            }
        } else if (msgLower == "kthxbye") {
            api.Messages.send("/)", data.channel);
            process.exit();
        }
    }
    if (data.msg.toLowerCase().startsWith("!boops")) {
        if (api.timeout_manager.checkTimeout(data.channel, "cmd.boops")) {
            api.Messages.send("Chat has been booped " + (storage.getItem("boops") || 0) + " times", data.channel);
        } else {
            sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.boops") / 1000) + " sec. and try again.", true);
        }
    } else if (data.msg.toLowerCase().startsWith("!butts")) {
        if (api.timeout_manager.checkTimeout(data.channel, "cmd.butts")) {
            api.Messages.send("Chat has mentioned butts " + (storage.getItem("butts") || 0) + " times", data.channel);
        } else {
            sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.butts") / 1000) + " sec. and try again.", true);
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
