var api;
var storage;
var fs = require('fs');

var songEnabled = false;
var currentSongData;
var currentLine = 0;

function handleMsg(data) {
    var pars = data.msg.toLowerCase().split(' ');
    if (pars[0] === "!song") {
        if (pars[1]) {
            fs.readFile("./songs/" + pars[1].toLowerCase().replace(/\W/g, ''), 'utf8', function (err, fdata) {
                if (err) {
                    sendMessage(data, "Song '" + pars[1] + "' was not found.", data.whisper);
                    currentSongData = [];
                    currentLine = 0;
                    songEnabled = false;
                } else {
                    songEnabled = !songEnabled;
                    sendMessage(data, "Let's sing '" + pars[1] + "'", data.whisper);
                    currentSongData = fdata.split("\n");
                    currentLine = 0;
                    songEnabled = true;
                }
            });
        } else {
            sendMessage(data, "No song selected.", false);
            currentSongData = [];
            currentLine = 0;
            songEnabled = false;
        }
    } else if (pars[0] === "!songlist") {
        sendMessage(data, "Songs: " + fs.readdirSync("./songs/").join(", "), data.whisper);
    } else if (songEnabled && !data.msg.startsWith("!") && !api.user_manager.isBot(data)) {
        var msgLower = data.msg.toLowerCase().replace(/\W/g, '');

        //console.log(currentSongData[currentLine].toLowerCase().replace(/\W/g, ''));
        //console.log(msgLower);

        if (data.msg == "..." || currentSongData[currentLine].toLowerCase().replace(/\W/g, '') == msgLower || (msgLower.length > 5 && currentSongData[currentLine].toLowerCase().replace(/\W/g, '').indexOf(msgLower) > -1)) {
            if (data.msg != "...") {
                currentLine++;
            }
            if (currentLine > currentSongData.length - 3) {
                sendMessage(data, currentSongData[currentLine] + "<End Song>", data.whisper);
                currentLine++;
            } else if (currentLine > currentSongData.length - 2) {
                sendMessage(data, "<End Song>", data.whisper);
                songEnabled = false;
                currentLine = 0;
            } else {
                sendMessage(data, currentSongData[currentLine], data.whisper);
                currentLine++;
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
        name: "Song",
        version: "1.0.0",
        description: "Sing stuff",
        author: "Tschrock (CyberPon3)",
        storage_options: {
            interval: 5000
        },
        commandhelp: [
            {command: "!song", usage: "!song <songname>", description: "Loads a song to sing", permission: ""},
            {command: "!songlist", usage: "!songlist", description: "Lists songs available", permission: ""}
        ]
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", handleMsg);
        api.Events.on("whisper", handleMsg);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMsg);
        api.Events.removeListener("whisper", handleMsg);
    }
}
