var api;
var storage;

var MessageTypes = require('../modules/messagetypes');
var EventTypes = require('../modules/eventtypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'boops' && event.claim()) {
        if (!command.sender.hasPermission("cmd.boops")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType !== MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.boops")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.boops"));
        } else {
            command.reply("Chat has been booped " + (storage.getItem("boops") || 0) + " times");
        }
    } else if (command.command === 'butts' && event.claim()) {
        if (!command.sender.hasPermission("cmd.butts")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType !== MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.butts")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.butts"));
        } else {
            command.reply("Chat has mentioned butts " + (storage.getItem("butts") || 0) + " times");
        }
    } else if ((command.command === 'die' || command.command === 'kill' || command.command === 'crash') && event.claim()) {
        if (command.messageType !== MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.die")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.die"));
        } else {
            command.reply("Help, Cyber! They're trying to hurt me!");
        }
    }
}

function handleMsg(event) {
    var message = event.data;
    var msgLower = message.content.toLowerCase();
    if (msgLower.indexOf("boop") !== -1) {
        var msgs = storage.getItem("boops") || 0;
        msgs++;
        storage.setItem("boops", msgs);
        if (msgLower.indexOf("boops " + message.channel.accountname.toLowerCase()) !== -1
                || msgLower.indexOf("boop " + message.channel.accountname.toLowerCase()) !== -1) {
            message.reply("/me boops " + message.sender.username);
        } else if (msgLower.indexOf("boops ") === -1 && message.channel.checkTimeout("trigger.boop", 30000)) {
            message.reply("boop");
        }
    }
    if (/butt($|z|s|[^a-z])/gi.test(msgLower)
            || msgLower.indexOf("flank") !== -1
            || msgLower.indexOf("booties") !== -1
            || msgLower.indexOf("booty") !== -1) {
        var msgs = storage.getItem("butts") || 0;
        msgs++;
        storage.setItem("butts", msgs);
    }


    if (msgLower.indexOf("skittle") !== -1 && message.channel.checkTimeout("trigger.skittle", 60000)) {
        message.reply("TASTE THE RAINBOW!");
    } else if (msgLower.indexOf("wake me up inside") !== -1) {
        if (message.channel.checkTimeout("trigger.wakemeup", 60000)) {
            message.reply("♫ Save me from the nothing I've become. ♫");
        }
    } else if (msgLower.replace(/\W/g, '').indexOf("cant wake up") !== -1) {
        if (message.channel.checkTimeout("trigger.cantwakeup", 60000)) {
            message.reply("♫ Wake me up inside. ♫");
        }
    } else if (msgLower.indexOf("you spin me right round baby right round") !== -1) {
        if (message.channel.checkTimeout("trigger.spinme", 60000)) {
            message.reply("♫ Like a record, baby, Right round round round ♫");
        }
    } else if (msgLower.indexOf("never gonna give you up") !== -1) {
        if (message.channel.checkTimeout("trigger.rickroll", 60000)) {
            message.reply("♫ Never gonna let you down!♫ ");
        }
    } else if (msgLower.indexOf("youtube.com/watch?v=dQw4w9WgXcQ".toLowerCase()) !== -1) {
        if (message.channel.checkTimeout("trigger.rickroll2", 40000)) {
            message.reply("You can't Rick-Roll me that easily!");
        }
    } else if (msgLower.indexOf("it's too late to apologize") !== -1) {
        if (message.channel.checkTimeout("trigger.toolate", 40000)) {
            message.reply("♫ it's too late ♫");
        }
    } else if (msgLower.indexOf("i saw the sign") !== -1) {
        if (message.channel.checkTimeout("trigger.thesign", 40000)) {
            message.reply("♫ and it opened up my eyes I saw the sign ♫");
        }
    } else if (msgLower.indexOf("kill " + message.channel.accountname.toLowerCase()) !== -1
            || msgLower.replace(/\W/g, '').indexOf("die " + message.channel.accountname.toLowerCase()) !== -1) {
        if (message.channel.checkTimeout("trigger.die", 40000)) {
            message.reply("Help, Cyber! They're trying to hurt me!");
        }
    } else if (msgLower === "kthxbye") {
        message.reply("/)");
        process.exit();
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
        api.events.on(EventTypes.CHATCOMMAND, handleCommand);
        api.events.on(EventTypes.USERMESSAGE, handleMsg);
        api.events.on(EventTypes.WHISPER, handleMsg);
        api.events.on(EventTypes.MEMESSAGE, handleMsg);
    },
    stop: function () {
        api.events.removeListener(EventTypes.CHATCOMMAND, handleCommand);
        api.events.removeListener(EventTypes.USERMESSAGE, handleMsg);
        api.events.removeListener(EventTypes.WHISPER, handleMsg);
        api.events.removeListener(EventTypes.MEMESSAGE, handleMsg);
    }
};
